from backend.supabase_client import supabase

# Get Bob Johnson's ID
bob_id = "0155517a-6406-4cea-9425-990e32820803"

print("=== Bob Johnson's Contributions Detailed ===")

# Get all of Bob's contributions
contribs = supabase.table('contributions').select('*').eq('user_id', bob_id).order('due_date', desc=True).execute()

print(f"Bob Johnson has {len(contribs.data)} contributions:")
print()

for contrib in contribs.data:
    status_icon = {
        'paid': '✅',
        'late': '❌', 
        'pending': '⏳',
        'overdue': '🔴'
    }.get(contrib['status'], '❓')
    
    paid_info = f", Paid: {contrib.get('paid_date', 'Not paid')}" if contrib.get('paid_date') else ""
    
    print(f"{status_icon} ${contrib['amount']} - Status: {contrib['status']} - Due: {contrib['due_date']}{paid_info}")
    print(f"   ID: {contrib['id']}")
    print()

print("=== Analysis ===")
paid_contribs = [c for c in contribs.data if c['status'] == 'paid']
late_contribs = [c for c in contribs.data if c['status'] == 'late']

print(f"Contributions with status 'paid': {len(paid_contribs)} = ${sum(c['amount'] for c in paid_contribs)}")
print(f"Contributions with status 'late': {len(late_contribs)} = ${sum(c['amount'] for c in late_contribs)}")

# Check if any 'late' contributions have a paid_date
late_but_paid = [c for c in late_contribs if c.get('paid_date')]
if late_but_paid:
    print(f"\n🚨 ISSUE FOUND: {len(late_but_paid)} contributions marked 'late' but have paid_date:")
    for c in late_but_paid:
        print(f"   ${c['amount']} due {c['due_date']}, paid {c['paid_date']} - should be status 'paid'!")
