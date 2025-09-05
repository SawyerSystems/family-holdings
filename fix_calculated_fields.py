#!/usr/bin/env python3
"""
Fix calculated fields in the database.
This script recalculates total_contributed and current_loan_balance for all users.
"""

from backend.supabase_client import supabase

def recalculate_user_totals(user_id):
    """Recalculate totals for a specific user"""
    print(f"Recalculating totals for user {user_id}...")
    
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
    
    print(f"  Updated: total_contributed = ${total_contributed}, current_loan_balance = ${current_loan_balance}")
    return total_contributed, current_loan_balance

def main():
    print("=== Fixing Calculated Fields in Database ===")
    print()
    
    # Get all users
    users_res = supabase.table('profiles').select('id, full_name, total_contributed, current_loan_balance').execute()
    
    print("Current state (before fix):")
    for user in users_res.data:
        print(f"  {user['full_name']}: ${user['total_contributed']} contributed, ${user['current_loan_balance']} loan balance")
    print()
    
    print("Recalculating...")
    print()
    
    # Fix each user
    for user in users_res.data:
        try:
            new_contributed, new_loan_balance = recalculate_user_totals(user['id'])
            print(f"  {user['full_name']}: ${user['total_contributed']} -> ${new_contributed} | ${user['current_loan_balance']} -> ${new_loan_balance}")
        except Exception as e:
            print(f"  ERROR for {user['full_name']}: {e}")
    
    print()
    print("=== Verification ===")
    
    # Verify the fix
    users_res_after = supabase.table('profiles').select('id, full_name, total_contributed, current_loan_balance').execute()
    
    print("Final state (after fix):")
    for user in users_res_after.data:
        print(f"  {user['full_name']}: ${user['total_contributed']} contributed, ${user['current_loan_balance']} loan balance")
    
    print()
    print("✅ Database fix completed!")
    print()
    print("Next steps:")
    print("1. Manually add database triggers in Supabase dashboard")
    print("2. Or implement trigger logic in application code")
    print("3. Test that new contributions/loans update totals correctly")

if __name__ == "__main__":
    main()
