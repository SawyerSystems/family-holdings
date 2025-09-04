-- Family Holdings Database Schema Migration
-- Run this in the Supabase SQL editor

-- Create custom types (enums)
DO $$ BEGIN
    CREATE TYPE contribution_status AS ENUM ('pending','completed','late','missed');
EXCEPTION WHEN duplicate_object THEN 
    RAISE NOTICE 'Type contribution_status already exists, skipping';
END $$;

DO $$ BEGIN
    CREATE TYPE loan_status AS ENUM ('pending','approved','rejected','paid');
EXCEPTION WHEN duplicate_object THEN 
    RAISE NOTICE 'Type loan_status already exists, skipping';
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin','member');
EXCEPTION WHEN duplicate_object THEN 
    RAISE NOTICE 'Type user_role already exists, skipping';
END $$;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role user_role NOT NULL DEFAULT 'member',
  weekly_contribution numeric(10,2) DEFAULT 0,
  total_contributed numeric(12,2) DEFAULT 0,
  borrowing_limit numeric(12,2) DEFAULT 0,
  current_loan_balance numeric(12,2) DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Contributions table
CREATE TABLE IF NOT EXISTS contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period_year int NOT NULL,
  period_week int NOT NULL,
  amount numeric(10,2) NOT NULL,
  status contribution_status NOT NULL DEFAULT 'pending',
  due_date date NOT NULL,
  paid_at timestamptz,
  method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_period UNIQUE(user_id, period_year, period_week)
);

-- Create indexes for contributions
CREATE INDEX IF NOT EXISTS idx_contributions_user ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_period ON contributions(period_year, period_week);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  status loan_status NOT NULL DEFAULT 'pending',
  reason text,
  duration_weeks int NOT NULL,
  weekly_payment numeric(10,2) NOT NULL,
  remaining_balance numeric(12,2) NOT NULL,
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for loans
CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);

-- Loan payments table
CREATE TABLE IF NOT EXISTS loan_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  payment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for loan_payments
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan ON loan_payments(loan_id);

-- Trigger function to update profile totals
CREATE OR REPLACE FUNCTION trg_update_profile_totals() 
RETURNS trigger AS $$
BEGIN
  UPDATE profiles p SET 
    total_contributed = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM contributions c
      WHERE c.user_id = p.id AND c.status = 'completed'
    )
  WHERE p.id = NEW.user_id;
  RETURN NEW;
END; 
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS after_contribution_complete ON contributions;

-- Create trigger for contribution completion
CREATE TRIGGER after_contribution_complete
  AFTER UPDATE OF status ON contributions
  FOR EACH ROW 
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION trg_update_profile_totals();

-- Trigger function to update loan remaining balance
CREATE OR REPLACE FUNCTION trg_update_loan_balance() 
RETURNS trigger AS $$
BEGIN
  UPDATE loans l SET 
    remaining_balance = l.amount - (
      SELECT COALESCE(SUM(amount), 0) 
      FROM loan_payments lp
      WHERE lp.loan_id = l.id
    )
  WHERE l.id = NEW.loan_id;
  
  -- Mark loan as paid if remaining balance <= 0
  UPDATE loans l SET 
    status = 'paid'
  WHERE l.id = NEW.loan_id 
    AND l.remaining_balance <= 0 
    AND l.status = 'approved';
    
  RETURN NEW;
END; 
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS after_loan_payment ON loan_payments;

-- Create trigger for loan payments
CREATE TRIGGER after_loan_payment
  AFTER INSERT ON loan_payments
  FOR EACH ROW 
  EXECUTE FUNCTION trg_update_loan_balance();

-- Sample data insertion (optional - comment out if not needed)
-- Insert a sample admin user (you'll need to replace the UUID with a real auth.users id)
/*
INSERT INTO profiles (id, full_name, role, weekly_contribution, borrowing_limit) 
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with real auth user UUID
  'Admin User',
  'admin',
  0,
  5000
) ON CONFLICT (id) DO NOTHING;
*/

-- Enable Row Level Security (RLS) - Uncomment when ready for production auth
/*
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust as needed)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own contributions" ON contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own loans" ON loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own loan payments" ON loan_payments FOR SELECT USING (auth.uid() = user_id);
*/

SELECT 'Database schema migration completed successfully!' as status;
