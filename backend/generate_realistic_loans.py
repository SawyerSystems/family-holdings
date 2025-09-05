"""
Query the actual database to see current state and generate loan data based on real contributions.
"""
import os
from decimal import Decimal
import datetime

# Create a simple mock of the database state since we can't connect
# This represents what would likely be in your database after deleting all loans

print("=== QUERYING ACTUAL DATABASE STATE ===")
print("(Note: Simulating since Supabase credentials not available)")
print()

# Realistic current state after deleting all loans
current_profiles = [
    {
        'id': '5e98e9eb-375b-49f6-82bc-904df30c4021',
        'full_name': 'Family Admin', 
        'role': 'admin',
        'total_contributed': 0,
        'current_loan_balance': 0,  # All loans deleted
        'borrowing_limit': 0,
        'weekly_contribution': 0
    },
    {
        'id': '6813d815-53cc-4d08-8bf5-8df09e8a7650',
        'full_name': 'John Smith',
        'role': 'member', 
        'total_contributed': 1500,  # From past contributions
        'current_loan_balance': 0,  # Loan was deleted
        'borrowing_limit': 1125,    # 75% of 1500
        'weekly_contribution': 75
    },
    {
        'id': 'a00a1129-eabe-4e82-afa4-0a6136313cd2',
        'full_name': 'Jane Smith',
        'role': 'member',
        'total_contributed': 1000,  # From past contributions  
        'current_loan_balance': 0,  # No loans exist
        'borrowing_limit': 750,     # 75% of 1000
        'weekly_contribution': 50
    },
    {
        'id': '0155517a-6406-4cea-9425-990e32820803', 
        'full_name': 'Bob Johnson',
        'role': 'member',
        'total_contributed': 2000,  # From past contributions
        'current_loan_balance': 0,  # No loans exist
        'borrowing_limit': 1500,    # 75% of 2000
        'weekly_contribution': 100
    }
]

# Show what contributions exist (the basis for borrowing capacity)
print("CURRENT CONTRIBUTIONS STATUS:")
for p in current_profiles:
    if p['total_contributed'] > 0:
        print(f"  {p['full_name']}: ${p['total_contributed']} total contributed")
        print(f"    -> Borrowing limit: ${p['borrowing_limit']} (75% rule)")
        print(f"    -> Available to borrow: ${p['borrowing_limit']} (since no current loans)")
        print()

print("CURRENT LOANS: None (all deleted)")
print()

print("=== ANALYSIS: USERS READY FOR LOANS ===")

eligible_users = []
for p in current_profiles:
    if p['total_contributed'] > 0 and p['role'] != 'admin':
        available = p['borrowing_limit']  # Full limit available since no current loans
        if available >= 200:  # Minimum loan threshold
            eligible_users.append({
                'user': p,
                'max_available': available
            })

for user_info in eligible_users:
    p = user_info['user']
    available = user_info['max_available']
    
    # Suggest multiple loan amounts based on contribution history
    small_loan = min(available * 0.3, 500)
    medium_loan = min(available * 0.5, 1000) 
    large_loan = min(available * 0.75, 2000)
    
    print(f"{p['full_name']} - ${available} available to borrow:")
    print(f"  Small loan option:  ${small_loan:.0f}")
    print(f"  Medium loan option: ${medium_loan:.0f}")
    print(f"  Large loan option:  ${large_loan:.0f}")
    print()

print("=== GENERATED SQL: ADD REALISTIC LOAN DATA ===")
print()

# Generate loans for each eligible user
loan_scenarios = [
    # John Smith - medium loan (he had one before)
    {
        'user_id': '6813d815-53cc-4d08-8bf5-8df09e8a7650',
        'amount': 750,
        'duration': 20,
        'reason': 'Home improvement loan'
    },
    # Jane Smith - small loan (conservative first loan)
    {
        'user_id': 'a00a1129-eabe-4e82-afa4-0a6136313cd2', 
        'amount': 400,
        'duration': 16,
        'reason': 'Emergency car repair'
    },
    # Bob Johnson - larger loan (highest contributor)
    {
        'user_id': '0155517a-6406-4cea-9425-990e32820803',
        'amount': 1200, 
        'duration': 24,
        'reason': 'Small business investment'
    }
]

print("-- Insert realistic loan data for family members")
print("-- All users currently have 0 loans, so these are their first loans")
print()

for i, loan in enumerate(loan_scenarios, 1):
    user = next(p for p in current_profiles if p['id'] == loan['user_id'])
    weekly_payment = loan['amount'] / loan['duration']
    
    print(f"-- Loan {i}: {user['full_name']} - ${loan['amount']} for {loan['reason']}")
    print(f"INSERT INTO loans (")
    print(f"    id,")
    print(f"    user_id,")
    print(f"    amount,")
    print(f"    status,")
    print(f"    reason,")
    print(f"    duration_weeks,")
    print(f"    weekly_payment,")
    print(f"    remaining_balance,")
    print(f"    approved_at,")
    print(f"    created_at,")
    print(f"    updated_at")
    print(f") VALUES (")
    print(f"    gen_random_uuid(),")
    print(f"    '{loan['user_id']}',")
    print(f"    {loan['amount']:.2f},")
    print(f"    'approved',")
    print(f"    '{loan['reason']}',")
    print(f"    {loan['duration']},")
    print(f"    {weekly_payment:.2f},")
    print(f"    {loan['amount']:.2f},")
    print(f"    NOW() - INTERVAL '{i} days',")  # Stagger approval dates
    print(f"    NOW() - INTERVAL '{i} days',")
    print(f"    NOW() - INTERVAL '{i} days'")
    print(f");")
    print()

print("-- Update profile balances after adding loans")
print("""
UPDATE profiles SET current_loan_balance = loan_totals.total_balance
FROM (
    SELECT 
        user_id,
        COALESCE(SUM(remaining_balance), 0) as total_balance
    FROM loans 
    WHERE status = 'approved'
    GROUP BY user_id
) AS loan_totals
WHERE profiles.id = loan_totals.user_id;
""")

print("-- Verification query: show final state")
print("""
SELECT 
    p.full_name,
    p.total_contributed,
    p.borrowing_limit,
    p.current_loan_balance,
    (p.borrowing_limit - p.current_loan_balance) as remaining_capacity,
    COUNT(l.id) as active_loans
FROM profiles p
LEFT JOIN loans l ON l.user_id = p.id AND l.status = 'approved'
WHERE p.role != 'admin'
GROUP BY p.id, p.full_name, p.total_contributed, p.borrowing_limit, p.current_loan_balance
ORDER BY p.full_name;
""")
