#!/usr/bin/env python3
"""
Inspect current Supabase database schema and generate SQL migration files.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    print("ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment")
    print("Please add them to your .env file")
    exit(1)

# Initialize Supabase client
try:
    supabase: Client = create_client(supabase_url, supabase_key)
    print("✓ Connected to Supabase")
except Exception as e:
    print(f"ERROR: Failed to connect to Supabase: {e}")
    exit(1)

def check_table_exists(table_name):
    """Check if a table exists in the database."""
    try:
        result = supabase.table(table_name).select("*").limit(1).execute()
        return True
    except Exception:
        return False

def check_enum_exists(enum_name):
    """Check if an enum type exists."""
    try:
        # Query information_schema for enum types
        query = f"""
        SELECT 1 FROM pg_type 
        WHERE typname = '{enum_name}' AND typtype = 'e'
        """
        result = supabase.rpc('exec_sql', {'sql': query}).execute()
        return len(result.data) > 0 if result.data else False
    except Exception as e:
        print(f"Warning: Could not check enum {enum_name}: {e}")
        return False

def get_table_columns(table_name):
    """Get column information for a table."""
    try:
        # This is a simplified check - in production you'd use information_schema
        result = supabase.table(table_name).select("*").limit(0).execute()
        return True  # Table exists and is accessible
    except Exception:
        return False

def generate_sql_files():
    """Generate SQL files based on current database state."""
    
    print("\n=== Inspecting Database Schema ===")
    
    # Check required tables
    tables_to_check = ['profiles', 'contributions', 'loans', 'loan_payments']
    missing_tables = []
    
    for table in tables_to_check:
        exists = check_table_exists(table)
        status = "✓ EXISTS" if exists else "✗ MISSING"
        print(f"Table '{table}': {status}")
        if not exists:
            missing_tables.append(table)
    
    # Check enums (this might not work with basic supabase-py, but we'll try)
    enums_to_check = ['contribution_status', 'loan_status', 'user_role']
    missing_enums = []
    
    for enum in enums_to_check:
        # For now, we'll assume they're missing and include them in our SQL
        missing_enums.append(enum)
        print(f"Enum '{enum}': ✗ ASSUMED MISSING (will recreate)")
    
    print(f"\n=== Generating SQL Files ===")
    
    # Generate the complete migration SQL
    migration_sql = """-- Family Holdings Database Schema Migration
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
"""

    # Write the migration file
    sql_file_path = os.path.join(os.path.dirname(__file__), '..', 'supabase_migration.sql')
    with open(sql_file_path, 'w') as f:
        f.write(migration_sql)
    
    print(f"✓ Generated: {sql_file_path}")
    
    # Generate a separate file for sample data
    sample_data_sql = """-- Sample Data for Family Holdings
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
"""
    
    sample_file_path = os.path.join(os.path.dirname(__file__), '..', 'supabase_sample_data.sql')
    with open(sample_file_path, 'w') as f:
        f.write(sample_data_sql)
    
    print(f"✓ Generated: {sample_file_path}")
    
    print(f"\n=== Instructions ===")
    print(f"1. Open Supabase Dashboard > SQL Editor")
    print(f"2. Copy and paste the contents of 'supabase_migration.sql'")
    print(f"3. Run the migration script")
    print(f"4. Optionally run 'supabase_sample_data.sql' for test data")
    print(f"5. Update any user UUIDs in the sample data to match real auth.users")
    
    return True

if __name__ == "__main__":
    try:
        generate_sql_files()
        print(f"\n✓ Database inspection and SQL generation completed!")
    except Exception as e:
        print(f"\nERROR: {e}")
        exit(1)
