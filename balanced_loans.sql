-- Add balanced loan data based on current contribution analysis
-- This adds loans for users with available borrowing capacity

-- Add loan for Jane Smith ($450 of $750 available capacity - 60%)
INSERT INTO loans (id, user_id, amount, status, reason, duration_weeks, weekly_payment, remaining_balance, approved_at, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'a00a1129-eabe-4e82-afa4-0a6136313cd2',
    450.00,
    'approved',
    'Auto-generated based on contribution history',
    16,
    28.12,
    450.00,
    NOW(),
    NOW(),
    NOW()
);

-- Add loan for Bob Johnson ($900 of $1500 available capacity - 60%)
INSERT INTO loans (id, user_id, amount, status, reason, duration_weeks, weekly_payment, remaining_balance, approved_at, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '0155517a-6406-4cea-9425-990e32820803',
    900.00,
    'approved', 
    'Auto-generated based on contribution history',
    16,
    56.25,
    900.00,
    NOW(),
    NOW(),
    NOW()
);

-- Recompute all user metrics after adding loans
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

-- Verification: Check final state
SELECT id, full_name, total_contributed, borrowing_limit, current_loan_balance,
       (borrowing_limit - current_loan_balance) AS available_capacity
FROM profiles
ORDER BY available_capacity;
