from fastapi import APIRouter, Depends
from decimal import Decimal
from dependencies import require_admin
import supabase_client

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
