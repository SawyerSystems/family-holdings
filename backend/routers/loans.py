from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from dependencies import get_current_user, require_admin, UserContext
import supabase_client
from models import LoanRequest, LoanActionResponse

router = APIRouter(prefix="/loans", tags=["loans"])

def _fetch_loan(loan_id: str):
    res = supabase_client.supabase.table('loans').select('*').eq('id', loan_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Loan not found")
    return res.data[0]

@router.get("/mine")
def my_loans(user: UserContext = Depends(get_current_user)):
    res = supabase_client.supabase.table('loans').select('*').eq('user_id', user.id).execute()
    return res.data

@router.get("", dependencies=[Depends(require_admin)])
def all_loans():
    return supabase_client.supabase.table('loans').select('*').execute().data

@router.post("/request", response_model=LoanActionResponse)
def request_loan(payload: LoanRequest, user: UserContext = Depends(get_current_user)):
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

@router.post("/{loan_id}/payment", response_model=LoanActionResponse)
def loan_payment(loan_id: str, payload: dict, user: UserContext = Depends(get_current_user)):
    amount = Decimal(str(payload.get('amount', 0)))
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
    res = supabase_client.supabase.table('loans').update(update).eq('id', loan_id).execute()
    row = res.data[0]
    return LoanActionResponse(id=row['id'], status=row['status'], amount=Decimal(str(row['amount'])), remaining_balance=Decimal(str(row['remaining_balance'])), weekly_payment=Decimal(str(row['weekly_payment'])) if row.get('weekly_payment') is not None else None)
