from backend.supabase_client import supabase

print("=== Fixing Bob Johnson's Week 32 Contribution ===")

contribution_id = "b8895be5-003b-461d-b863-7d1353ee2914"

# Update the contribution to reflect it was actually paid
result = supabase.table('contributions').update({
    'status': 'paid',
    'paid_amount': 100.0,
    'date_paid': '2025-08-11'
}).eq('id', contribution_id).execute()

print(f"Updated contribution {contribution_id}")
print(f"Result: {result}")

print("\n=== Recalculating Bob Johnson's totals ===")

# Now recalculate Bob's totals
bob_id = "0155517a-6406-4cea-9425-990e32820803"

# Get all paid contributions
paid_contribs = supabase.table('contributions').select('amount').eq('user_id', bob_id).eq('status', 'paid').execute()
total_contributed = sum(float(contrib['amount']) for contrib in paid_contribs.data)

# Update Bob's profile
profile_result = supabase.table('profiles').update({
    'total_contributed': total_contributed
}).eq('id', bob_id).execute()

print(f"Bob Johnson's new total_contributed: ${total_contributed}")
print(f"Profile update result: {profile_result}")

print("\n=== Verification ===")
# Check Bob's updated data
bob_profile = supabase.table('profiles').select('full_name, total_contributed').eq('id', bob_id).execute()
print(f"Verified: {bob_profile.data[0]['full_name']} now has ${bob_profile.data[0]['total_contributed']} total contributed")

# Count paid contributions
paid_count = len(paid_contribs.data)
print(f"Paid contributions: {paid_count} × $100 = ${paid_count * 100}")
