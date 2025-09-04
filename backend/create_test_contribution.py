#!/usr/bin/env python3

# Script to create a new completed contribution
import sys
sys.path.insert(0, '/workspaces/family-holdings/backend')

import supabase_client
from decimal import Decimal
from datetime import datetime

def create_new_completed_contribution():
    """Create a new contribution with completed status"""
    
    user_id = "5e98e9eb-375b-49f6-82bc-904df30c4021"
    
    print("Creating new contribution with completed status...")
    
    # Create a new contribution
    new_contrib = {
        'user_id': user_id,
        'week_ending': '2024-12-01',
        'due_date': '2024-11-29',
        'expected_amount': 100.0,
        'paid_amount': 100.0,
        'status': 'paid',
        'late_fee': 0.0,
        'period_year': 2024,
        'period_week': 48,
        'amount': 100.0
    }
    
    res = supabase_client.supabase.table('contributions').insert(new_contrib).execute()
    
    if res.data:
        print(f"✅ Successfully created contribution: {res.data[0]['id']}")
        print(f"Status: {res.data[0]['status']}")
        print(f"Amount: ${res.data[0]['amount']}")
        
        # Now recalculate total contributions
        print("\nRecalculating user's total contributions...")
        
        contrib_res = supabase_client.supabase.table('contributions').select('amount').eq('user_id', user_id).eq('status', 'completed').execute()
        
        total_contributed = Decimal('0.00')
        if contrib_res.data:
            total_contributed = sum(Decimal(str(contrib.get('amount', 0))) for contrib in contrib_res.data)
        
        print(f"Total contributions calculated: ${total_contributed}")
        
        # Update the user's profile
        profile_res = supabase_client.supabase.table('profiles').update({
            'total_contributed': float(total_contributed)
        }).eq('id', user_id).execute()
        
        if profile_res.data:
            print(f"✅ Updated user profile. Total contributed: ${profile_res.data[0]['total_contributed']}")
            borrowing_limit = float(total_contributed) * 0.75
            print(f"Expected borrowing limit (75%): ${borrowing_limit}")
            return True
        else:
            print("❌ Failed to update user profile")
            return False
    else:
        print("❌ Failed to create contribution")
        return False

if __name__ == "__main__":
    try:
        success = create_new_completed_contribution()
        if success:
            print("\n🎉 Test data created successfully!")
        else:
            print("\n💥 Failed to create test data")
    except Exception as e:
        print(f"Error: {e}")
