from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from dependencies import get_current_user, UserContext
import supabase_client
from models import StatsMeOut

router = APIRouter(prefix="/stats", tags=["stats"])

def _calculate_user_borrowing_limit(user_id: str, total_contributed: Decimal) -> Decimal:
    """Calculate borrowing limit based on user's borrow_limit_percent and total contributions"""
    # Get user's borrow_limit_percent setting
    user_res = supabase_client.supabase.table('users').select('borrow_limit_percent').eq('id', user_id).execute()
    
    if not user_res.data:
        borrow_limit_percent = Decimal('75.0')  # Default fallback
    else:
        borrow_limit_percent = Decimal(str(user_res.data[0].get('borrow_limit_percent', 75.0)))
    
    return (total_contributed * (borrow_limit_percent / Decimal('100'))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

def _get_user_current_loan_balance(user_id: str) -> Decimal:
    """Get user's current outstanding loan balance"""
    res = supabase_client.supabase.table('loans').select('remaining_balance').eq('user_id', user_id).eq('status', 'approved').execute()
    if not res.data:
        return Decimal('0.00')
    
    total_balance = sum(Decimal(str(loan.get('remaining_balance', 0))) for loan in res.data)
    return Decimal(str(total_balance))

@router.get("/me", response_model=StatsMeOut)
def stats_me(user: UserContext = Depends(get_current_user)):
    # Fetch profile
    prof_res = supabase_client.supabase.table('profiles').select('*').eq('id', user.id).execute()
    if not prof_res.data:
        # If profile missing, create a transient view with defaults
        profile = {
            'id': user.id,
            'weekly_contribution': Decimal(0),
            'total_contributed': Decimal(0),
            'borrowing_limit': Decimal(0),
            'current_loan_balance': Decimal(0),
            'joined_at': datetime.now(timezone.utc).isoformat()
        }
    else:
        profile = prof_res.data[0]

    weekly = Decimal(str(profile.get('weekly_contribution') or 0))
    total_contributed = Decimal(str(profile.get('total_contributed') or 0))
    
    # Calculate borrowing limit as 75% of total contributions
    calculated_borrowing_limit = _calculate_user_borrowing_limit(user.id, total_contributed)
    current_loan_balance = _get_user_current_loan_balance(user.id)

    # Weeks active
    joined_raw = profile.get('joined_at')
    try:
        joined_at = datetime.fromisoformat(joined_raw.replace('Z', '+00:00')) if isinstance(joined_raw, str) else datetime.now(timezone.utc)
    except Exception:
        joined_at = datetime.now(timezone.utc)
    now = datetime.now(timezone.utc)
    delta_days = max((now - joined_at).days, 0)
    weeks_active = max(delta_days // 7, 1)

    expected_total = weekly * weeks_active
    deficiency = expected_total - total_contributed
    if deficiency < 0:
        deficiency = Decimal(0)

    return StatsMeOut(
        weekly_contribution=weekly,
        weeks_active=weeks_active,
        expected_total=expected_total,
        actual_total=total_contributed,
        deficiency=deficiency,
        current_loan_balance=current_loan_balance,
        borrowing_limit=calculated_borrowing_limit
    )
