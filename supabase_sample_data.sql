-- Sample Data for Family Holdings
-- Run this AFTER the main migration if you want test data

-- Sample contributions for testing (adjust user_id as needed)
INSERT INTO contributions (user_id, period_year, period_week, amount, status, due_date) VALUES
  ('00000000-0000-0000-0000-000000000000', 2024, 35, 50.00, 'completed', '2024-08-30'),
  ('00000000-0000-0000-0000-000000000000', 2024, 36, 50.00, 'pending', '2024-09-06')
ON CONFLICT (user_id, period_year, period_week) DO NOTHING;

-- Sample loan for testing (adjust user_id as needed)
INSERT INTO loans (user_id, amount, status, reason, duration_weeks, weekly_payment, remaining_balance) VALUES
  ('00000000-0000-0000-0000-000000000000', 500.00, 'approved', 'Emergency expense', 10, 50.00, 500.00)
ON CONFLICT DO NOTHING;

SELECT 'Sample data inserted successfully!' as status;
