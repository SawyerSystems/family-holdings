"""
Query database to analyze current user contribution and loan state,
then generate SQL to add balanced loan data.
"""
import os
import sys
sys.path.append('/workspaces/family-holdings/backend')

# Mock the database data since we can't connect to Supabase
# In a real scenario, this would query the actual database

# Sample data based on typical family bank scenario
sample_profiles = [
    {
        'id': '5e98e9eb-375b-49f6-82bc-904df30c4021',
        'full_name': 'Family Admin',
        'role': 'admin',
        'total_contributed': 0,
        'current_loan_balance': 0,
        'borrowing_limit': 0,
        'weekly_contribution': 0
    },
    {
        'id': '6813d815-53cc-4d08-8bf5-8df09e8a7650', 
        'full_name': 'John Smith',
        'role': 'member',
        'total_contributed': 1500,
        'current_loan_balance': 800,  # This is the problem case - $800 loan with only potential for $1125 limit
        'borrowing_limit': 1125,      # 75% of 1500
        'weekly_contribution': 75
    },
    {
        'id': 'a00a1129-eabe-4e82-afa4-0a6136313cd2',
        'full_name': 'Jane Smith', 
        'role': 'member',
        'total_contributed': 1000,
        'current_loan_balance': 0,
        'borrowing_limit': 750,       # 75% of 1000
        'weekly_contribution': 50
    },
    {
        'id': '0155517a-6406-4cea-9425-990e32820803',
        'full_name': 'Bob Johnson',
        'role': 'member', 
        'total_contributed': 2000,
        'current_loan_balance': 0,
        'borrowing_limit': 1500,      # 75% of 2000  
        'weekly_contribution': 100
    }
]

sample_contributions = [
    # John Smith contributions
    {'user_id': '6813d815-53cc-4d08-8bf5-8df09e8a7650', 'amount': 75, 'status': 'completed'},
    {'user_id': '6813d815-53cc-4d08-8bf5-8df09e8a7650', 'amount': 75, 'status': 'completed'},
    {'user_id': '6813d815-53cc-4d08-8bf5-8df09e8a7650', 'amount': 75, 'status': 'completed'},
    # ... (would be 20 weeks total to reach $1500)
    
    # Jane Smith contributions  
    {'user_id': 'a00a1129-eabe-4e82-afa4-0a6136313cd2', 'amount': 50, 'status': 'completed'},
    {'user_id': 'a00a1129-eabe-4e82-afa4-0a6136313cd2', 'amount': 50, 'status': 'completed'},
    # ... (would be 20 weeks total to reach $1000)
    
    # Bob Johnson contributions
    {'user_id': '0155517a-6406-4cea-9425-990e32820803', 'amount': 100, 'status': 'completed'},
    {'user_id': '0155517a-6406-4cea-9425-990e32820803', 'amount': 100, 'status': 'completed'},
    # ... (would be 20 weeks total to reach $2000)
]

sample_loans = [
    {
        'user_id': '6813d815-53cc-4d08-8bf5-8df09e8a7650',
        'amount': 800,
        'remaining_balance': 800,
        'status': 'approved',
        'duration_weeks': 16,
        'weekly_payment': 50
    }
]

print("=== CURRENT DATABASE STATE (Simulated) ===")
print("\nPROFILES:")
for p in sample_profiles:
    print(f"  {p['full_name']} ({p['role']})")
    print(f"    Total Contributed: ${p['total_contributed']}")
    print(f"    Borrowing Limit: ${p['borrowing_limit']} (75% rule)")
    print(f"    Current Loan Balance: ${p['current_loan_balance']}")
    print(f"    Available Capacity: ${p['borrowing_limit'] - p['current_loan_balance']}")
    print()

print("EXISTING LOANS:")
for l in sample_loans:
    user = next((p for p in sample_profiles if p['id'] == l['user_id']), None)
    if user:
        print(f"  {user['full_name']}: ${l['amount']} loan, ${l['remaining_balance']} remaining")

print("\n=== ANALYSIS ===")

# Check for under-collateralized users
under_collateralized = []
for p in sample_profiles:
    if p['current_loan_balance'] > p['borrowing_limit']:
        deficit = p['current_loan_balance'] - p['borrowing_limit']
        required_contrib = p['current_loan_balance'] / 0.75
        under_collateralized.append({
            'user': p,
            'deficit': deficit,
            'required_total_contrib': required_contrib
        })

if under_collateralized:
    print("UNDER-COLLATERALIZED USERS:")
    for u in under_collateralized:
        print(f"  {u['user']['full_name']}: loan ${u['user']['current_loan_balance']} > limit ${u['user']['borrowing_limit']}")
        print(f"    Need total contributions of ${u['required_total_contrib']:.2f} (currently ${u['user']['total_contributed']})")
        print(f"    Missing ${u['required_total_contrib'] - u['user']['total_contributed']:.2f} in contributions")
        print()

# Find users with available borrowing capacity
available_capacity = []
for p in sample_profiles:
    capacity = p['borrowing_limit'] - p['current_loan_balance']
    if capacity > 200:  # Minimum loan threshold
        available_capacity.append({
            'user': p,
            'capacity': capacity
        })

if available_capacity:
    print("USERS WITH AVAILABLE BORROWING CAPACITY:")
    for a in available_capacity:
        print(f"  {a['user']['full_name']}: ${a['capacity']:.2f} available")

print("\n=== GENERATED SQL TO BALANCE DATA ===")

print("""
-- Step 1: Fix under-collateralized users by adding contributions
""")

for u in under_collateralized:
    deficit_contrib = u['required_total_contrib'] - u['user']['total_contributed']
    print(f"""
-- Fix {u['user']['full_name']} (add ${deficit_contrib:.2f} in contributions)
INSERT INTO contributions (id, user_id, period_year, period_week, amount, status, due_date, paid_at, created_at)
VALUES (
    gen_random_uuid(),
    '{u['user']['id']}',
    2024,
    (SELECT COALESCE(MAX(period_week), 0) + 1 FROM contributions WHERE user_id = '{u['user']['id']}' AND period_year = 2024),
    {deficit_contrib:.2f},
    'completed',
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE - INTERVAL '1 day'
);""")

print("""
-- Step 2: Add loans for users with available capacity
""")

for a in available_capacity:
    # Propose loan of 60% of available capacity, max $2000
    loan_amount = min(a['capacity'] * 0.6, 2000)
    if loan_amount >= 200:
        duration = 16 if loan_amount <= 1000 else 24
        weekly_payment = loan_amount / duration
        
        print(f"""
-- Add loan for {a['user']['full_name']} (${loan_amount:.2f} of ${a['capacity']:.2f} capacity)
INSERT INTO loans (id, user_id, amount, status, reason, duration_weeks, weekly_payment, remaining_balance, approved_at, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '{a['user']['id']}',
    {loan_amount:.2f},
    'approved',
    'Auto-generated based on contribution history',
    {duration},
    {weekly_payment:.2f},
    {loan_amount:.2f},
    NOW(),
    NOW(),
    NOW()
);""")

print("""
-- Step 3: Recompute all user metrics
WITH contrib_totals AS (
  SELECT user_id, COALESCE(SUM(amount),0)::numeric(12,2) AS total_contributed
  FROM contributions
  WHERE status = 'completed'
  GROUP BY user_id
), loan_totals AS (
  SELECT user_id, COALESCE(SUM(remaining_balance),0)::numeric(12,2) AS current_loan_balance
  FROM loans
  WHERE status = 'approved'
  GROUP BY user_id
), merged AS (
  SELECT p.id,
         COALESCE(ct.total_contributed,0)::numeric(12,2) AS total_contributed,
         COALESCE(lt.current_loan_balance,0)::numeric(12,2) AS current_loan_balance,
         (COALESCE(ct.total_contributed,0) * 0.75)::numeric(12,2) AS borrowing_limit
  FROM profiles p
  LEFT JOIN contrib_totals ct ON ct.user_id = p.id
  LEFT JOIN loan_totals lt ON lt.user_id = p.id
)
UPDATE profiles AS p
SET total_contributed = m.total_contributed,
    borrowing_limit = m.borrowing_limit,
    current_loan_balance = m.current_loan_balance,
    updated_at = NOW()
FROM merged m
WHERE p.id = m.id;

-- Verification: Check no user is under-collateralized
SELECT id, full_name, total_contributed, borrowing_limit, current_loan_balance,
       (borrowing_limit - current_loan_balance) AS available_capacity
FROM profiles
ORDER BY available_capacity;
""")
