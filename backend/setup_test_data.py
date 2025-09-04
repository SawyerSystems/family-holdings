#!/usr/bin/env python3

# Script to simulate a completed contribution and test loan limits
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, '/workspaces/family-holdings/backend')

import supabase_client
from decimal import Decimal

def create_completed_contribution():
    """Create a test contribution with completed status"""
    
    # First, let's see if we can update the existing contribution
    contribution_id = "177d06ab-8c4d-4438-b19f-4ebe0dd976d6"
    user_id = "5e98e9eb-375b-49f6-82bc-904df30c4021"
    
    print("Updating existing contribution to completed status...")
    
    # Update the contribution to completed
    res = supabase_client.supabase.table('contributions').update({
        'status': 'completed',
        'paid_amount': 50.0,
        'paid_at': '2025-01-04T19:30:00.000Z',
        'method': 'bank_transfer'
    }).eq('id', contribution_id).execute()
    
    if res.data:
        print(f"Successfully updated contribution: {res.data[0]['id']}")
        print(f"Status: {res.data[0]['status']}")
        print(f"Paid Amount: ${res.data[0]['paid_amount']}")
    else:
        print("Failed to update contribution")
        return False
    
    # Now recalculate the user's total contributions
    print("\nRecalculating user's total contributions...")
    
    # Get all completed contributions for this user
    contrib_res = supabase_client.supabase.table('contributions').select('amount').eq('user_id', user_id).eq('status', 'completed').execute()
    
    total_contributed = Decimal('0.00')
    if contrib_res.data:
        total_contributed = sum(Decimal(str(contrib.get('amount', 0))) for contrib in contrib_res.data)
    
    print(f"Total contributions calculated: ${total_contributed}")
    
    # Update the user's profile with the new total
    profile_res = supabase_client.supabase.table('profiles').update({
        'total_contributed': float(total_contributed)
    }).eq('id', user_id).execute()
    
    if profile_res.data:
        print(f"Updated user profile. Total contributed: ${profile_res.data[0]['total_contributed']}")
        print(f"Expected borrowing limit (75%): ${float(total_contributed) * 0.75}")
        return True
    else:
        print("Failed to update user profile")
        return False

if __name__ == "__main__":
    try:
        print("Testing loan limit with completed contribution...")
        success = create_completed_contribution()
        if success:
            print("\n✅ Test setup complete! Now test the API endpoints.")
        else:
            print("\n❌ Test setup failed.")
    except Exception as e:
        print(f"Error: {e}")
