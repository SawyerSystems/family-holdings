from backend.supabase_client import supabase

print("=== All Contributions Investigation ===")

# Get all contributions
all_contribs = supabase.table('contributions').select('*').execute()
print(f"Total contributions in database: {len(all_contribs.data)}")

print("\nAll contributions:")
for contrib in all_contribs.data:
    print(f"  User: {contrib['user_id']}, Amount: ${contrib['amount']}, Status: {contrib['status']}, Due: {contrib['due_date']}")

print("\nContributions by user:")
from collections import defaultdict
user_contribs = defaultdict(list)
for contrib in all_contribs.data:
    user_contribs[contrib['user_id']].append(contrib)

# Get user names
users = supabase.table('profiles').select('id, full_name').execute()
user_names = {user['id']: user['full_name'] for user in users.data}

for user_id, contribs in user_contribs.items():
    user_name = user_names.get(user_id, 'Unknown')
    print(f"\n{user_name} ({user_id}):")
    total_paid = 0
    total_all = 0
    for contrib in contribs:
        status_indicator = "✅" if contrib['status'] == 'paid' else "❌" if contrib['status'] == 'late' else "⏳"
        print(f"  {status_indicator} ${contrib['amount']} - {contrib['status']} - Due: {contrib['due_date']}")
        if contrib['status'] == 'paid':
            total_paid += contrib['amount']
        total_all += contrib['amount']
    print(f"  → Paid total: ${total_paid}, All total: ${total_all}")
