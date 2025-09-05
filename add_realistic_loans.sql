-- Add realistic loan data for family members who have contribution history
-- Current state: All users have 0 loans, so full borrowing capacity available

-- Loan 1: John Smith - $750 home improvement loan (67% of his $1125 capacity)
INSERT INTO loans (
    id,
    user_id,
    amount,
    status,
    reason,
    duration_weeks,
    weekly_payment,
    remaining_balance,
    approved_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '6813d815-53cc-4d08-8bf5-8df09e8a7650',
    750.00,
    'approved',
    'Home improvement loan',
    20,
    37.50,
    750.00,
    NOW() - INTERVAL '1 days',
    NOW() - INTERVAL '1 days',
    NOW() - INTERVAL '1 days'
);

-- Loan 2: Jane Smith - $400 emergency car repair (53% of her $750 capacity) 
INSERT INTO loans (
    id,
    user_id,
    amount,
    status,
    reason,
    duration_weeks,
    weekly_payment,
    remaining_balance,
    approved_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'a00a1129-eabe-4e82-afa4-0a6136313cd2',
    400.00,
    'approved',
    'Emergency car repair',
    16,
    25.00,
    400.00,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
);

-- Loan 3: Bob Johnson - $1200 small business investment (80% of his $1500 capacity)
INSERT INTO loans (
    id,
    user_id,
    amount,
    status,
    reason,
    duration_weeks,
    weekly_payment,
    remaining_balance,
    approved_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '0155517a-6406-4cea-9425-990e32820803',
    1200.00,
    'approved',
    'Small business investment',
    24,
    50.00,
    1200.00,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
);

-- Update profile current_loan_balance after adding loans
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

-- Reset any users without loans to 0 balance
UPDATE profiles SET current_loan_balance = 0 WHERE id NOT IN (
    SELECT DISTINCT user_id FROM loans WHERE status = 'approved'
);

-- Verification: Check final balances comply with 75% rule
SELECT 
    p.full_name,
    p.total_contributed,
    p.borrowing_limit,
    p.current_loan_balance,
    (p.borrowing_limit - p.current_loan_balance) as remaining_capacity,
    CASE 
        WHEN p.current_loan_balance <= p.borrowing_limit THEN '✓ Compliant'
        ELSE '✗ Over-limit' 
    END as status
FROM profiles p
WHERE p.role != 'admin'
ORDER BY p.full_name;
