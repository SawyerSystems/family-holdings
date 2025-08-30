-- Initial schema for Family Holdings
-- Safe re-runnable guards using IF NOT EXISTS

-- Extensions (uncomment if needed in your project)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN
		CREATE TYPE contribution_status AS ENUM ('pending','completed','late','missed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
		CREATE TYPE loan_status AS ENUM ('pending','approved','rejected','paid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
		CREATE TYPE user_role AS ENUM ('admin','member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Profiles table
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
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Contributions
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
	UNIQUE(user_id, period_year, period_week)
);
CREATE INDEX IF NOT EXISTS idx_contributions_user ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_period ON contributions(period_year, period_week);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);

-- Loans
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
CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);

-- Loan payments
CREATE TABLE IF NOT EXISTS loan_payments (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	loan_id uuid NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
	user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	amount numeric(10,2) NOT NULL,
	payment_date timestamptz DEFAULT now(),
	created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan ON loan_payments(loan_id);

-- Triggers
CREATE OR REPLACE FUNCTION trg_update_profile_totals() RETURNS trigger AS $$
BEGIN
	UPDATE profiles p SET total_contributed = (
		SELECT COALESCE(SUM(amount),0) FROM contributions c
		WHERE c.user_id = p.id AND c.status = 'completed'
	) WHERE p.id = NEW.user_id;
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_contribution_complete ON contributions;
CREATE TRIGGER after_contribution_complete
AFTER UPDATE OF status ON contributions
FOR EACH ROW WHEN (NEW.status = 'completed')
EXECUTE FUNCTION trg_update_profile_totals();

-- Future: trigger for remaining_balance updates after loan payments

