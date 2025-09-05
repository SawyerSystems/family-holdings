"""
Database utilities for maintaining calculated fields.
This module provides functions to keep total_contributed and current_loan_balance accurate.
"""

from supabase_client import supabase

def recalculate_user_totals(user_id: str):
    """
    Recalculate and update total_contributed and current_loan_balance for a user.
    
    Args:
        user_id (str): UUID of the user to recalculate
    
    Returns:
        dict: The updated totals
    """
    try:
        # Calculate total contributions (paid only)
        contrib_res = supabase.table('contributions').select('amount').eq('user_id', user_id).eq('status', 'paid').execute()
        total_contributed = sum(float(contrib['amount']) for contrib in contrib_res.data)
        
        # Calculate current loan balance (approved loans only)
        loans_res = supabase.table('loans').select('remaining_balance').eq('user_id', user_id).eq('status', 'approved').execute()
        current_loan_balance = sum(float(loan['remaining_balance']) for loan in loans_res.data)
        
        # Update the profile
        update_res = supabase.table('profiles').update({
            'total_contributed': total_contributed,
            'current_loan_balance': current_loan_balance
        }).eq('id', user_id).execute()
        
        return {
            'user_id': user_id,
            'total_contributed': total_contributed,
            'current_loan_balance': current_loan_balance
        }
        
    except Exception as e:
        print(f"Error recalculating totals for user {user_id}: {e}")
        raise e

def recalculate_all_user_totals():
    """
    Recalculate totals for all users in the system.
    
    Returns:
        list: List of updated user totals
    """
    try:
        # Get all users
        users_res = supabase.table('profiles').select('id').execute()
        
        results = []
        for user in users_res.data:
            result = recalculate_user_totals(user['id'])
            results.append(result)
            
        return results
        
    except Exception as e:
        print(f"Error recalculating all user totals: {e}")
        raise e

def update_user_totals_after_contribution_change(user_id: str):
    """
    Update user totals after a contribution is added, modified, or deleted.
    This should be called whenever contribution data changes.
    """
    return recalculate_user_totals(user_id)

def update_user_totals_after_loan_change(user_id: str):
    """
    Update user totals after a loan is added, modified, or deleted.
    This should be called whenever loan data changes.
    """
    return recalculate_user_totals(user_id)

def update_user_totals_after_payment(user_id: str, loan_id: str = None):
    """
    Update user totals after a loan payment.
    This should be called whenever a loan payment is made.
    """
    return recalculate_user_totals(user_id)
