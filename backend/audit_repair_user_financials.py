"""Audit and (optionally) repair user financial integrity.

Integrity rule:
  borrowing_limit = 75% of total_contributed (business rule)
  current_loan_balance must be <= borrowing_limit

If current_loan_balance > borrowing_limit, user is under-collateralized.
We can fix by either:
  A) Backfilling additional "completed" contribution(s) to raise total_contributed
  B) Reducing loan remaining balances (NOT applied automatically here)

This script only GENERATES SQL; it does not mutate the database directly.
Run:
  python backend/audit_repair_user_financials.py > repair_plan.sql
Then review and execute chosen sections.
"""
from decimal import Decimal, ROUND_HALF_UP
from collections import defaultdict
import datetime
import supabase_client

CONTRIB_STATUS_TARGET = 'completed'  # matches enum

# Pull data
profiles = supabase_client.supabase.table('profiles').select('*').execute().data or []
contribs = supabase_client.supabase.table('contributions').select('user_id, amount, status, period_year, period_week').execute().data or []
loans = supabase_client.supabase.table('loans').select('user_id, remaining_balance, status').eq('status','approved').execute().data or []

paid_sum = defaultdict(lambda: Decimal('0.00'))
for c in contribs:
    if c.get('status') == CONTRIB_STATUS_TARGET:
        try:
            paid_sum[c['user_id']] += Decimal(str(c.get('amount',0)))
        except Exception:
            pass

loan_balance = defaultdict(lambda: Decimal('0.00'))
for l in loans:
    try:
        loan_balance[l['user_id']] += Decimal(str(l.get('remaining_balance',0)))
    except Exception:
        pass

now = datetime.datetime.utcnow()
iso_year, iso_week, _ = now.isocalendar()

under_collateralized = []
for p in profiles:
    uid = p['id']
    total_contributed = paid_sum[uid]
    required_min = loan_balance[uid] / Decimal('0.75') if loan_balance[uid] > 0 else Decimal('0.00')
    if loan_balance[uid] > 0 and total_contributed * Decimal('0.75') < loan_balance[uid]:
        deficit = (required_min - total_contributed).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        under_collateralized.append({
            'id': uid,
            'current_total_contributed': total_contributed,
            'current_loan_balance': loan_balance[uid],
            'required_min_total_contributed': required_min.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'deficit_to_cover': deficit
        })

print('-- AUDIT REPORT: Under-collateralized Users')
for row in under_collateralized:
    print(f"-- User {row['id']} loan_balance={row['current_loan_balance']} total_contributed={row['current_total_contributed']} required_min={row['required_min_total_contributed']} deficit={row['deficit_to_cover']}")

print('\n-- OPTION A: Direct profile field adjustments (does NOT create contribution records)')
for row in under_collateralized:
    new_total = row['required_min_total_contributed']
    new_borrowing_limit = (new_total * Decimal('0.75')).quantize(Decimal('0.01'))
    print(f"UPDATE profiles SET total_contributed = {new_total}, borrowing_limit = {new_borrowing_limit}, updated_at = NOW() WHERE id = '{row['id']}';")

print('\n-- OPTION B: Backfill a single synthetic completed contribution to cover deficit')
print('-- NOTE: Adjust period_year/week if collision occurs with existing UNIQUE(user_id, period_year, period_week).')
for row in under_collateralized:
    deficit = row['deficit_to_cover']
    if deficit <= 0:
        continue
    print(f"INSERT INTO contributions (id, user_id, period_year, period_week, amount, status, due_date, paid_at) VALUES (gen_random_uuid(), '{row['id']}', {iso_year}, {iso_week}, {deficit}, '{CONTRIB_STATUS_TARGET}', CURRENT_DATE, NOW()) ON CONFLICT DO NOTHING;")

print('\n-- After choosing & executing one option, run 002_recompute_user_metrics.sql to normalize derived fields again.')
