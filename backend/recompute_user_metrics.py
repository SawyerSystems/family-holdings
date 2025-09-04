"""Utility script to recompute and print user financial metrics based on current DB state.

Run inside backend environment (ensure SUPABASE credentials env vars are set if required by supabase_client module).
"""
from decimal import Decimal, ROUND_HALF_UP
from collections import defaultdict
import supabase_client

# Fetch base profile list
profiles_res = supabase_client.supabase.table('profiles').select('*').execute()
profiles = profiles_res.data or []

# Fetch contributions (completed only) and loans (approved only)
contrib_res = supabase_client.supabase.table('contributions').select('user_id, amount, status').eq('status','completed').execute()
loan_res = supabase_client.supabase.table('loans').select('user_id, remaining_balance, status').eq('status','approved').execute()

paid_sum = defaultdict(lambda: Decimal('0.00'))
if contrib_res.data:
    for c in contrib_res.data:
        try:
            paid_sum[c['user_id']] += Decimal(str(c.get('amount',0)))
        except Exception:
            pass

loan_balance = defaultdict(lambda: Decimal('0.00'))
if loan_res.data:
    for l in loan_res.data:
        try:
            loan_balance[l['user_id']] += Decimal(str(l.get('remaining_balance',0)))
        except Exception:
            pass

rows = []
for p in profiles:
    uid = p['id']
    total_contributed = paid_sum[uid]
    borrowing_limit = (total_contributed * Decimal('0.75')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    current_loan_balance = loan_balance[uid].quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    rows.append({
        'id': uid,
        'full_name': p.get('full_name'),
        'role': p.get('role'),
        'weekly_contribution': p.get('weekly_contribution'),
        'total_contributed_new': str(total_contributed),
        'borrowing_limit_new': str(borrowing_limit),
        'current_loan_balance_new': str(current_loan_balance)
    })

print("Computed Metrics (preview):")
for r in rows:
    print(r)

print("\nSuggested SQL UPDATE statements:")
for r in rows:
    print(f"UPDATE profiles SET total_contributed = {r['total_contributed_new']}, borrowing_limit = {r['borrowing_limit_new']}, current_loan_balance = {r['current_loan_balance_new']}, updated_at = NOW() WHERE id = '{r['id']}';")
