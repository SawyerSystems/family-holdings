-- CORRECTED: Sample Data for Family Holdings with Real User IDs
-- This file is corrected based on exact database structure analysis
-- Generated on 2025-08-30 23:45:00
-- Admin credentials: admin@familyholdings.local / FamilyAdmin2024!

-- IMPORTANT: This assumes the auth.users already exist from previous user creation script
-- Real User IDs (must exist in auth.users table):
-- Admin: 5e98e9eb-375b-49f6-82bc-904df30c4021
-- John: 6813d815-53cc-4d08-8bf5-8df09e8a7650  
-- Jane: a00a1129-eabe-4e82-afa4-0a6136313cd2
-- Bob: 0155517a-6406-4cea-9425-990e32820803

-- Insert admin profile (references auth.users.id)
INSERT INTO profiles (id, full_name, role, weekly_contribution, borrowing_limit, total_contributed) 
VALUES (
  '5e98e9eb-375b-49f6-82bc-904df30c4021',
  'Family Admin',
  'admin',
  0,
  10000,
  0
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  borrowing_limit = EXCLUDED.borrowing_limit;

-- Insert member profiles
INSERT INTO profiles (id, full_name, role, weekly_contribution, borrowing_limit, total_contributed) 
VALUES 
  ('6813d815-53cc-4d08-8bf5-8df09e8a7650', 'John Smith', 'member', 75, 1500, 0),
  ('a00a1129-eabe-4e82-afa4-0a6136313cd2', 'Jane Smith', 'member', 50, 1000, 0),
  ('0155517a-6406-4cea-9425-990e32820803', 'Bob Johnson', 'member', 100, 2000, 0)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  weekly_contribution = EXCLUDED.weekly_contribution,
  borrowing_limit = EXCLUDED.borrowing_limit;

-- Sample contributions with ALL REQUIRED FIELDS
-- Required: user_id, amount, expected_amount, week_ending, period_year, period_week, due_date, status
-- IMPORTANT: Status constraint only allows: 'pending', 'paid', 'late' (NOT 'completed')

-- John's contributions (last 4 weeks)
INSERT INTO contributions (user_id, amount, expected_amount, week_ending, period_year, period_week, due_date, status, paid_at, method) 
VALUES 
  ('6813d815-53cc-4d08-8bf5-8df09e8a7650', 75, 75, '2025-08-31', 2025, 35, '2025-08-30', 'pending', NULL, 'bank_transfer'),
  ('6813d815-53cc-4d08-8bf5-8df09e8a7650', 75, 75, '2025-08-24', 2025, 34, '2025-08-23', 'paid', '2025-08-23 10:00:00', 'bank_transfer'),
  ('6813d815-53cc-4d08-8bf5-8df09e8a7650', 75, 75, '2025-08-17', 2025, 33, '2025-08-16', 'paid', '2025-08-16 10:00:00', 'bank_transfer'),
  ('6813d815-53cc-4d08-8bf5-8df09e8a7650', 75, 75, '2025-08-10', 2025, 32, '2025-08-09', 'paid', '2025-08-09 10:00:00', 'bank_transfer')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;

-- Jane's contributions
INSERT INTO contributions (user_id, amount, expected_amount, week_ending, period_year, period_week, due_date, status, paid_at, method) 
VALUES 
  ('a00a1129-eabe-4e82-afa4-0a6136313cd2', 50, 50, '2025-08-31', 2025, 35, '2025-08-30', 'pending', NULL, 'bank_transfer'),
  ('a00a1129-eabe-4e82-afa4-0a6136313cd2', 50, 50, '2025-08-24', 2025, 34, '2025-08-23', 'paid', '2025-08-23 10:00:00', 'bank_transfer'),
  ('a00a1129-eabe-4e82-afa4-0a6136313cd2', 50, 50, '2025-08-17', 2025, 33, '2025-08-16', 'paid', '2025-08-16 10:00:00', 'bank_transfer'),
  ('a00a1129-eabe-4e82-afa4-0a6136313cd2', 50, 50, '2025-08-10', 2025, 32, '2025-08-09', 'paid', '2025-08-09 10:00:00', 'bank_transfer')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;

-- Bob's contributions
INSERT INTO contributions (user_id, amount, expected_amount, week_ending, period_year, period_week, due_date, status, paid_at, method) 
VALUES 
  ('0155517a-6406-4cea-9425-990e32820803', 100, 100, '2025-08-31', 2025, 35, '2025-08-30', 'pending', NULL, 'bank_transfer'),
  ('0155517a-6406-4cea-9425-990e32820803', 100, 100, '2025-08-24', 2025, 34, '2025-08-23', 'paid', '2025-08-23 10:00:00', 'bank_transfer'),
  ('0155517a-6406-4cea-9425-990e32820803', 100, 100, '2025-08-17', 2025, 33, '2025-08-16', 'paid', '2025-08-16 10:00:00', 'bank_transfer'),
  ('0155517a-6406-4cea-9425-990e32820803', 100, 100, '2025-08-10', 2025, 32, '2025-08-09', 'late', '2025-08-11 15:30:00', 'bank_transfer')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;

-- Sample loans with ALL REQUIRED FIELDS
-- Required: user_id, amount, reason, remaining_balance, duration_weeks, status
-- IMPORTANT: Loan status constraint allows: 'pending', 'approved', 'active' (NOT 'rejected', 'paid')

-- John's approved loan
INSERT INTO loans (id, user_id, amount, reason, remaining_balance, duration_weeks, status, approved_at) 
VALUES (
  'd4bb7eab-d5a9-4e3e-b78c-0e1615d8fcd2',
  '6813d815-53cc-4d08-8bf5-8df09e8a7650',
  600.00,
  'Home repair emergency',
  600.00,
  12,
  'approved',
  '2025-08-23 14:30:00'
);

-- Jane's pending loan
INSERT INTO loans (user_id, amount, reason, remaining_balance, duration_weeks, status) 
VALUES (
  'a00a1129-eabe-4e82-afa4-0a6136313cd2',
  300.00,
  'Car maintenance',
  300.00,
  8,
  'pending'
);

-- Sample loan payment (if loan_payments table exists)
INSERT INTO loan_payments (loan_id, user_id, amount, payment_date) 
VALUES ('d4bb7eab-d5a9-4e3e-b78c-0e1615d8fcd2', '6813d815-53cc-4d08-8bf5-8df09e8a7650', 50.00, '2025-08-27 09:15:00')
ON CONFLICT DO NOTHING;

-- Update calculated totals (triggers should handle this automatically)
UPDATE profiles SET total_contributed = (
  SELECT COALESCE(SUM(amount), 0) 
  FROM contributions 
  WHERE contributions.user_id = profiles.id AND status = 'paid'
);

UPDATE profiles SET current_loan_balance = (
  SELECT COALESCE(SUM(remaining_balance), 0) 
  FROM loans 
  WHERE loans.user_id = profiles.id AND status = 'approved'
);

SELECT 'Sample data with real users created successfully!' as status;
SELECT 'Total profiles: ' || COUNT(*) as profile_count FROM profiles;
SELECT 'Total contributions: ' || COUNT(*) as contribution_count FROM contributions;
SELECT 'Total loans: ' || COUNT(*) as loan_count FROM loans;
