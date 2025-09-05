from fastapi import APIRouter, Depends
from decimal import Decimal
from dependencies import require_admin, UserContext
import supabase_client
from db_utils import recalculate_all_user_totals, recalculate_user_totals

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/recalculate-contributions", dependencies=[Depends(require_admin)])
def recalculate_all_contributions():
    """Recalculate total_contributed for all users based on completed contributions"""
    
    # Get all users
    users_res = supabase_client.supabase.table('profiles').select('id').execute()
    if not users_res.data:
        return {"message": "No users found"}
    
    updated_users = []
    
    for user in users_res.data:
        user_id = user['id']
        
        # Calculate total completed contributions for this user
        contrib_res = supabase_client.supabase.table('contributions').select('amount').eq('user_id', user_id).eq('status', 'paid').execute()
        
        total_contributed = Decimal('0.00')
        if contrib_res.data:
            total_contributed = sum(Decimal(str(contrib.get('amount', 0))) for contrib in contrib_res.data)
        
        # Update user profile with calculated total
        update_res = supabase_client.supabase.table('profiles').update({
            'total_contributed': float(total_contributed)
        }).eq('id', user_id).execute()
        
        if update_res.data:
            updated_users.append({
                'user_id': user_id,
                'total_contributed': float(total_contributed),
                'borrowing_limit': float(total_contributed * Decimal('0.75'))
            })
    
    return {
        "message": f"Recalculated contributions for {len(updated_users)} users",
        "updated_users": updated_users
    }

@router.post("/update-borrowing-limits", dependencies=[Depends(require_admin)])
def update_all_borrowing_limits():
    """Update borrowing limits for all users (75% of total contributions)"""
    
    # Get all users with their total contributions
    users_res = supabase_client.supabase.table('profiles').select('id, total_contributed').execute()
    if not users_res.data:
        return {"message": "No users found"}
    
    updated_users = []
    
    for user in users_res.data:
        user_id = user['id']
        total_contributed = Decimal(str(user.get('total_contributed', 0)))
        borrowing_limit = (total_contributed * Decimal('0.75')).quantize(Decimal('0.01'))
        
        # Update borrowing limit in profile
        update_res = supabase_client.supabase.table('profiles').update({
            'borrowing_limit': float(borrowing_limit)
        }).eq('id', user_id).execute()
        
        if update_res.data:
            updated_users.append({
                'user_id': user_id,
                'total_contributed': float(total_contributed),
                'borrowing_limit': float(borrowing_limit)
            })
    
    return {
        "message": f"Updated borrowing limits for {len(updated_users)} users",
        "updated_users": updated_users
    }

@router.post("/recalculate-all-totals-v2")
def recalculate_all_user_totals_endpoint(user: UserContext = Depends(require_admin)):
    """
    Recalculate total_contributed and current_loan_balance for all users.
    This is the improved version that handles both contributions and loans.
    """
    results = recalculate_all_user_totals()
    return {
        "message": "All user totals recalculated successfully",
        "users_updated": len(results),
        "results": results
    }

@router.post("/recalculate-user-totals/{user_id}")
def recalculate_single_user_totals_endpoint(user_id: str, user: UserContext = Depends(require_admin)):
    """
    Recalculate totals for a specific user.
    """
    result = recalculate_user_totals(user_id)
    return {
        "message": f"User totals recalculated successfully for user {user_id}",
        "result": result
    }
