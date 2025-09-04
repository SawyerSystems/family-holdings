from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from decimal import Decimal
from dependencies import get_current_user, UserContext
import supabase_client
from models import StatsMeOut

router = APIRouter(prefix="/stats", tags=["stats"])

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
    borrowing_limit = Decimal(str(profile.get('borrowing_limit') or 0))
    current_loan_balance = Decimal(str(profile.get('current_loan_balance') or 0))

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
        borrowing_limit=borrowing_limit
    )
