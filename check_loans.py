from backend.supabase_client import supabase

# Check what loan statuses exist
loans = supabase.table('loans').select('*').execute()
print("All loans:")
for loan in loans.data:
    print(f"  User: {loan.get('user_id', 'N/A')}, Status: {loan.get('status', 'N/A')}, Balance: {loan.get('remaining_balance', 'N/A')}")

print()
print("Unique statuses:")
statuses = set(loan.get('status') for loan in loans.data)
print(statuses)
