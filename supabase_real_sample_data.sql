-- Sample Data for Family Holdings with Real User IDs
-- Generated on 2025-08-30 23:13:38
-- Admin credentials: admin@familyholdings.local / FamilyAdmin2024!

-- Insert admin profile
INSERT INTO profiles (id, full_name, role, weekly_contribution, borrowing_limit, total_contributed) 
VALUES (
  '5e98e9eb-375b-49f6-82bc-904df30c4021',
  'Family Admin',
  'admin'::user_role,
  0,
  10000,
  0
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  borrowing_limit = EXCLUDED.borrowing_limit;

-- Insert member profile: John Smith
INSERT INTO profiles (id, full_name, role, weekly_contribution, borrowing_limit, total_contributed) 
VALUES (
  '6813d815-53cc-4d08-8bf5-8df09e8a7650',
  'John Smith',
  'member'::user_role,
  75,
  1500,  -- borrowing limit = 20 weeks of contributions
  0
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  weekly_contribution = EXCLUDED.weekly_contribution,
  borrowing_limit = EXCLUDED.borrowing_limit;

-- Insert member profile: Jane Smith
INSERT INTO profiles (id, full_name, role, weekly_contribution, borrowing_limit, total_contributed) 
VALUES (
  'a00a1129-eabe-4e82-afa4-0a6136313cd2',
  'Jane Smith',
  'member'::user_role,
  50,
  1000,  -- borrowing limit = 20 weeks of contributions
  0
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  weekly_contribution = EXCLUDED.weekly_contribution,
  borrowing_limit = EXCLUDED.borrowing_limit;

-- Insert member profile: Bob Johnson
INSERT INTO profiles (id, full_name, role, weekly_contribution, borrowing_limit, total_contributed) 
VALUES (
  '0155517a-6406-4cea-9425-990e32820803',
  'Bob Johnson',
  'member'::user_role,
  100,
  2000,  -- borrowing limit = 20 weeks of contributions
  0
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  weekly_contribution = EXCLUDED.weekly_contribution,
  borrowing_limit = EXCLUDED.borrowing_limit;


-- Sample contributions (last 4 weeks)
INSERT INTO contributions (user_id, period_year, period_week, amount, expected_amount, status, due_date, paid_at, method, week_ending) 
VALUES ('6813d815-53cc-4d08-8bf5-8df09e8a7650', 2025, 35, 75, 75, 'pending'::contribution_status, '2025-08-30', NULL, 'bank_transfer', '2025-08-31')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;

INSERT INTO contributions (user_id, period_year, period_week, amount, expected_amount, status, due_date, paid_at, method, week_ending) 
VALUES ('6813d815-53cc-4d08-8bf5-8df09e8a7650', 2025, 34, 75, 75, 'completed'::contribution_status, '2025-08-23', '2025-08-23 10:00:00', 'bank_transfer', '2025-08-24')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;

INSERT INTO contributions (user_id, period_year, period_week, amount, expected_amount, status, due_date, paid_at, method, week_ending) 
VALUES ('6813d815-53cc-4d08-8bf5-8df09e8a7650', 2025, 33, 75, 75, 'completed'::contribution_status, '2025-08-16', '2025-08-16 10:00:00', 'bank_transfer', '2025-08-17')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;

INSERT INTO contributions (user_id, period_year, period_week, amount, expected_amount, status, due_date, paid_at, method, week_ending) 
VALUES ('6813d815-53cc-4d08-8bf5-8df09e8a7650', 2025, 32, 75, 75, 'completed'::contribution_status, '2025-08-09', '2025-08-09 10:00:00', 'bank_transfer', '2025-08-10')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;

INSERT INTO contributions (user_id, period_year, period_week, amount, expected_amount, status, due_date, paid_at, method, week_ending) 
VALUES ('a00a1129-eabe-4e82-afa4-0a6136313cd2', 2025, 35, 50, 50, 'pending'::contribution_status, '2025-08-30', NULL, 'bank_transfer', '2025-08-31')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;

INSERT INTO contributions (user_id, period_year, period_week, amount, expected_amount, status, due_date, paid_at, method, week_ending) 
VALUES ('a00a1129-eabe-4e82-afa4-0a6136313cd2', 2025, 34, 50, 50, 'completed'::contribution_status, '2025-08-23', '2025-08-23 10:00:00', 'bank_transfer', '2025-08-24')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;

INSERT INTO contributions (user_id, period_year, period_week, amount, expected_amount, status, due_date, paid_at, method, week_ending) 
VALUES ('a00a1129-eabe-4e82-afa4-0a6136313cd2', 2025, 33, 50, 50, 'completed'::contribution_status, '2025-08-16', '2025-08-16 10:00:00', 'bank_transfer', '2025-08-17')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;

INSERT INTO contributions (user_id, period_year, period_week, amount, expected_amount, status, due_date, paid_at, method, week_ending) 
VALUES ('a00a1129-eabe-4e82-afa4-0a6136313cd2', 2025, 32, 50, 50, 'completed'::contribution_status, '2025-08-09', '2025-08-09 10:00:00', 'bank_transfer', '2025-08-10')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;

INSERT INTO contributions (user_id, period_year, period_week, amount, expected_amount, status, due_date, paid_at, method, week_ending) 
VALUES ('0155517a-6406-4cea-9425-990e32820803', 2025, 35, 100, 100, 'pending'::contribution_status, '2025-08-30', NULL, 'bank_transfer', '2025-08-31')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;

INSERT INTO contributions (user_id, period_year, period_week, amount, expected_amount, status, due_date, paid_at, method, week_ending) 
VALUES ('0155517a-6406-4cea-9425-990e32820803', 2025, 34, 100, 100, 'completed'::contribution_status, '2025-08-23', '2025-08-23 10:00:00', 'bank_transfer', '2025-08-24')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;

INSERT INTO contributions (user_id, period_year, period_week, amount, expected_amount, status, due_date, paid_at, method, week_ending) 
VALUES ('0155517a-6406-4cea-9425-990e32820803', 2025, 33, 100, 100, 'completed'::contribution_status, '2025-08-16', '2025-08-16 10:00:00', 'bank_transfer', '2025-08-17')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;

INSERT INTO contributions (user_id, period_year, period_week, amount, expected_amount, status, due_date, paid_at, method, week_ending) 
VALUES ('0155517a-6406-4cea-9425-990e32820803', 2025, 32, 100, 100, 'completed'::contribution_status, '2025-08-09', '2025-08-09 10:00:00', 'bank_transfer', '2025-08-10')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;


-- Sample loans
INSERT INTO loans (id, user_id, amount, status, reason, duration_weeks, weekly_payment, remaining_balance, approved_at) 
VALUES (
  'd4bb7eab-d5a9-4e3e-b78c-0e1615d8fcd2',
  '6813d815-53cc-4d08-8bf5-8df09e8a7650',
  600.00,
  'approved'::loan_status,
  'Home repair emergency',
  12,
  50.00,
  600.00,
  '2025-08-23 14:30:00'
);

-- Sample payment for the loan
INSERT INTO loan_payments (loan_id, user_id, amount, payment_date) 
VALUES ('d4bb7eab-d5a9-4e3e-b78c-0e1615d8fcd2', '6813d815-53cc-4d08-8bf5-8df09e8a7650', 50.00, '2025-08-27 09:15:00');

INSERT INTO loans (user_id, amount, status, reason, duration_weeks, weekly_payment, remaining_balance) 
VALUES (
  'a00a1129-eabe-4e82-afa4-0a6136313cd2',
  300.00,
  'pending'::loan_status,
  'Car maintenance',
  8,
  37.50,
  300.00
);


-- Refresh calculated totals (triggers should handle this automatically)
UPDATE profiles SET total_contributed = (
  SELECT COALESCE(SUM(amount), 0) 
  FROM contributions 
  WHERE contributions.user_id = profiles.id AND status = 'completed'
);

UPDATE profiles SET current_loan_balance = (
  SELECT COALESCE(SUM(remaining_balance), 0) 
  FROM loans 
  WHERE loans.user_id = profiles.id AND status = 'approved'
);

SELECT 'Sample data with real users created successfully!' as status;
