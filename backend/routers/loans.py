from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from dependencies import get_current_user, require_admin, UserContext
import supabase_client
from models import LoanRequest, LoanActionResponse, LoanPayment
from db_utils import update_user_totals_after_loan_change, update_user_totals_after_payment

router = APIRouter(prefix="/loans", tags=["loans"])

def _calculate_user_borrowing_limit(user_id: str) -> Decimal:
    """Calculate borrowing limit based on user's borrow_limit_percent and total paid contributions"""
    # Get user's borrow_limit_percent setting
    user_res = supabase_client.supabase.table('users').select('borrow_limit_percent').eq('id', user_id).execute()
    
    if not user_res.data:
        return Decimal('0.00')
    
    borrow_limit_percent = Decimal(str(user_res.data[0].get('borrow_limit_percent', 75.0)))
    
    # Get user's total paid contributions
    contrib_res = supabase_client.supabase.table('contributions').select('amount').eq('user_id', user_id).eq('status', 'paid').execute()
    
    total_contributed = Decimal('0.00')
    if contrib_res.data:
        total_contributed = sum(Decimal(str(contrib.get('amount', 0))) for contrib in contrib_res.data)
    
    # Calculate borrowing limit using user's configurable percentage
    borrowing_limit = (total_contributed * (borrow_limit_percent / Decimal('100'))).quantize(Decimal('0.01'))
    
    return borrowing_limit

def _get_user_current_loan_balance(user_id: str) -> Decimal:
    """Get user's current outstanding loan balance"""
    res = supabase_client.supabase.table('loans').select('remaining_balance').eq('user_id', user_id).eq('status', 'approved').execute()
    if not res.data:
        return Decimal('0.00')
    
    total_balance = sum((Decimal(str(loan.get('remaining_balance', 0))) for loan in res.data), Decimal('0.00'))
    return total_balance

def _fetch_loan(loan_id: str):
    res = supabase_client.supabase.table('loans').select('*').eq('id', loan_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Loan not found")
    return res.data[0]

@router.get("/mine")
def my_loans(user: UserContext = Depends(get_current_user)):
    res = supabase_client.supabase.table('loans').select('*').eq('user_id', user.id).execute()
    return res.data

@router.get("/my-capacity")
def my_loan_capacity(user: UserContext = Depends(get_current_user)):
    """Get user's borrowing capacity based on 75% of total contributions"""
    borrowing_limit = _calculate_user_borrowing_limit(user.id)
    current_loan_balance = _get_user_current_loan_balance(user.id)
    available_credit = borrowing_limit - current_loan_balance
    
    # Get total contributions for reference
    prof_res = supabase_client.supabase.table('profiles').select('total_contributed').eq('id', user.id).execute()
    total_contributed = Decimal(str(prof_res.data[0].get('total_contributed', 0))) if prof_res.data else Decimal('0.00')
    
    return {
        'total_contributed': float(total_contributed),
        'borrowing_limit': float(borrowing_limit),
        'current_loan_balance': float(current_loan_balance),
        'available_credit': float(available_credit),
        'loan_to_contribution_ratio': 0.75
    }

@router.get("", dependencies=[Depends(require_admin)])
def all_loans():
    return supabase_client.supabase.table('loans').select('*').execute().data

@router.post("/request", response_model=LoanActionResponse)
def request_loan(payload: LoanRequest, user: UserContext = Depends(get_current_user)):
    # Calculate user's borrowing limit (75% of total contributions)
    borrowing_limit = _calculate_user_borrowing_limit(user.id)
    current_loan_balance = _get_user_current_loan_balance(user.id)
    
    # Check if requested amount exceeds available credit
    available_credit = borrowing_limit - current_loan_balance
    if payload.amount > available_credit:
        raise HTTPException(
            status_code=400, 
            detail=f"Loan amount ${payload.amount} exceeds available credit of ${available_credit}. Your borrowing limit is 75% of total contributions (${borrowing_limit}), minus current balance (${current_loan_balance})."
        )
    
    weekly_payment = (payload.amount / payload.duration_weeks).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    insert = {
        'user_id': user.id,
        'amount': float(payload.amount),
        'status': 'pending',
        'reason': payload.reason,
        'duration_weeks': payload.duration_weeks,
        'weekly_payment': float(weekly_payment),
        'remaining_balance': float(payload.amount)
    }
    res = supabase_client.supabase.table('loans').insert(insert).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create loan request")
    row = res.data[0]
    return LoanActionResponse(id=row['id'], status=row['status'], amount=Decimal(str(row['amount'])), remaining_balance=Decimal(str(row['remaining_balance'])), weekly_payment=Decimal(str(row['weekly_payment'])))

@router.post("/{loan_id}/approve", response_model=LoanActionResponse, dependencies=[Depends(require_admin)])
def approve_loan(loan_id: str):
    loan = _fetch_loan(loan_id)
    if loan['status'] != 'pending':
        raise HTTPException(status_code=400, detail="Loan not pending")
    update = {'status': 'approved', 'approved_at': datetime.utcnow().isoformat()}
    res = supabase_client.supabase.table('loans').update(update).eq('id', loan_id).execute()
    
    # Update user totals after loan approval
    update_user_totals_after_loan_change(loan['user_id'])
    
    row = res.data[0]
    return LoanActionResponse(id=row['id'], status=row['status'], amount=Decimal(str(row['amount'])), remaining_balance=Decimal(str(row['remaining_balance'])), weekly_payment=Decimal(str(row['weekly_payment'])))

@router.post("/{loan_id}/reject", response_model=LoanActionResponse, dependencies=[Depends(require_admin)])
def reject_loan(loan_id: str):
    loan = _fetch_loan(loan_id)
    if loan['status'] != 'pending':
        raise HTTPException(status_code=400, detail="Loan not pending")
    update = {'status': 'rejected', 'rejected_at': datetime.utcnow().isoformat()}
    res = supabase_client.supabase.table('loans').update(update).eq('id', loan_id).execute()
    row = res.data[0]
    return LoanActionResponse(id=row['id'], status=row['status'], amount=Decimal(str(row['amount'])))

@router.post("/{loan_id}/cancel")
def cancel_loan(loan_id: str, user: UserContext = Depends(get_current_user)):
    loan = _fetch_loan(loan_id)
    if user.role != 'admin' and loan['user_id'] != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if loan['status'] not in ['pending']:
        raise HTTPException(status_code=400, detail="Only pending loans can be cancelled")
    res = supabase_client.supabase.table('loans').update({'status': 'rejected', 'rejected_at': datetime.utcnow().isoformat()}).eq('id', loan_id).execute()
    
    # Update user totals after loan cancellation
    update_user_totals_after_loan_change(loan['user_id'])
    
    row = res.data[0]
    return LoanActionResponse(id=row['id'], status=row['status'], amount=Decimal(str(row['amount'])))

@router.post("/{loan_id}/payment", response_model=LoanActionResponse)
def loan_payment(loan_id: str, payload: LoanPayment, user: UserContext = Depends(get_current_user)):
    amount = payload.amount
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
    loan = _fetch_loan(loan_id)
    if user.role != 'admin' and loan['user_id'] != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if loan['status'] != 'approved':
        raise HTTPException(status_code=400, detail="Loan not in approved status")
    remaining = Decimal(str(loan['remaining_balance'])) - amount
    if remaining <= 0:
        update = {'remaining_balance': 0, 'status': 'paid'}
    else:
        update = {'remaining_balance': float(remaining)}
    # Record the payment
    supabase_client.supabase.table('loan_payments').insert({
        'loan_id': loan_id,
        'user_id': loan['user_id'],
        'amount': float(amount),
        'payment_date': datetime.utcnow().isoformat()
    }).execute()
    # Update the loan
    res = supabase_client.supabase.table('loans').update(update).eq('id', loan_id).execute()
    
    # Update user totals after loan payment
    update_user_totals_after_payment(loan['user_id'], loan_id)
    
    row = res.data[0]
    return LoanActionResponse(id=row['id'], status=row['status'], amount=Decimal(str(row['amount'])), remaining_balance=Decimal(str(row['remaining_balance'])), weekly_payment=Decimal(str(row['weekly_payment'])) if row.get('weekly_payment') is not None else None)

@router.get("/{loan_id}/payments")
def list_payments(loan_id: str, user: UserContext = Depends(get_current_user)):
    loan = _fetch_loan(loan_id)
    if user.role != 'admin' and loan['user_id'] != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    res = supabase_client.supabase.table('loan_payments').select('*').eq('loan_id', loan_id).execute()
    return res.data
