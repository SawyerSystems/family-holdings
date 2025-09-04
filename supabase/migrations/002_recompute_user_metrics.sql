-- Recompute user financial metrics based on authoritative contribution & loan tables
-- Safe to run multiple times; values get recalculated.

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

-- Verification query (optional):
-- SELECT id, total_contributed, borrowing_limit, current_loan_balance FROM profiles ORDER BY id;
