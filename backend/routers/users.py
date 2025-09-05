from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_current_user, require_admin, UserContext
import supabase_client
from models import UserCreate, UserOut, UserUpdate
from datetime import datetime
from decimal import Decimal

router = APIRouter(prefix="/users", tags=["users"])

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

@router.get("/me", response_model=UserOut)
def get_me(user: UserContext = Depends(get_current_user)):
    data = supabase_client.supabase.table('profiles').select('*').eq('id', user.id).execute().data
    profile = data[0] if data else {
        'id': user.id,
        'full_name': None,
        'role': user.role,
        'weekly_contribution': None,
        'total_contributed': 0,
        'borrowing_limit': 0,
        'current_loan_balance': 0,
    }
    
    # Calculate real-time borrowing limit and current loan balance instead of using stored values
    calculated_borrowing_limit = _calculate_user_borrowing_limit(user.id)
    calculated_loan_balance = _get_user_current_loan_balance(user.id)
    
    # Override stored values with calculated ones
    profile['borrowing_limit'] = str(calculated_borrowing_limit)
    profile['current_loan_balance'] = str(calculated_loan_balance)
    profile['email'] = user.email
    return profile

@router.post("/signout")
def signout():
    """Sign out the current user"""
    # In a real JWT-based system, you would:
    # 1. Add the token to a blacklist/revocation list
    # 2. Or have the client discard the token
    # 
    # For now, since we're using mock auth, we just return success
    # The frontend should clear any stored user data/tokens
    return {
        "success": True,
        "message": "Successfully signed out"
    }

@router.get("", dependencies=[Depends(require_admin)])
def list_users():
    """List all users enriched with current business logic derived fields.

    Business rules applied per user:
      - total_contributed: sum of paid contributions (contributions.status = 'paid')
      - borrowing_limit: user's borrow_limit_percent of total_contributed (rounded to 2 decimals)
      - current_loan_balance: aggregate remaining_balance of approved loans
    Stored columns are not trusted for these derived values; they are recalculated live.
    """
    users_res = supabase_client.supabase.table('users').select('*').execute()
    users = users_res.data or []

    # Pre-fetch contributions & loans to reduce per-user round trips (basic optimization)
    # Use 'completed' which matches enum in schema (pending, completed, late, missed)
    contrib_res = supabase_client.supabase.table('contributions').select('user_id, amount, status').eq('status', 'completed').execute()
    loan_res = supabase_client.supabase.table('loans').select('user_id, remaining_balance, status').eq('status', 'approved').execute()

    from decimal import Decimal
    from collections import defaultdict

    paid_contrib_sum = defaultdict(lambda: Decimal('0.00'))
    if contrib_res.data:
        for c in contrib_res.data:
            try:
                paid_contrib_sum[c.get('user_id')] += Decimal(str(c.get('amount', 0)))
            except Exception:
                continue

    loan_balance_sum = defaultdict(lambda: Decimal('0.00'))
    if loan_res.data:
        for l in loan_res.data:
            try:
                loan_balance_sum[l.get('user_id')] += Decimal(str(l.get('remaining_balance', 0)))
            except Exception:
                continue

    enriched = []
    for user in users:
        uid = user.get('id')
        total_contributed = paid_contrib_sum[uid]
        
        # Get user's borrow_limit_percent for dynamic calculation
        borrow_limit_percent = Decimal(str(user.get('borrow_limit_percent', 75.0)))
        borrowing_limit = (total_contributed * (borrow_limit_percent / Decimal('100'))).quantize(Decimal('0.01'))
        
        current_loan_balance = loan_balance_sum[uid]
        # Preserve original user fields and override / add derived ones as strings for JSON compatibility
        enriched.append({
            **user,
            'total_contributed': str(total_contributed),
            'borrow_limit_percent': str(borrow_limit_percent),
            'current_loan_balance': str(current_loan_balance),
        })

    return enriched

@router.post("", dependencies=[Depends(require_admin)], response_model=UserOut)
def create_user(payload: UserCreate):
    # Phase 1: only create profile row (auth user creation later)
    insert = {
        'id': payload.email,  # TEMP placeholder id (replace with auth user id once real signup)
        'full_name': payload.full_name,
        'role': payload.role,
        'weekly_contribution': payload.weekly_contribution or 0,
        'joined_at': datetime.utcnow().isoformat()
    }
    res = supabase_client.supabase.table('profiles').insert(insert).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create user")
    out = res.data[0]
    out['email'] = payload.email
    return out

@router.patch("/{user_id}", dependencies=[Depends(require_admin)], response_model=UserOut)
def update_user(user_id: str, payload: UserUpdate):
    update_fields = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Convert Decimal values to float for JSON serialization
    for key, value in update_fields.items():
        if isinstance(value, Decimal):
            update_fields[key] = float(value)
    
    res = supabase_client.supabase.table('users').update(update_fields).eq('id', user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    return res.data[0]

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: str, user: UserContext = Depends(get_current_user)):
    if user.role != 'admin' and user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    res = supabase_client.supabase.table('users').select('*').eq('id', user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    return res.data[0]
