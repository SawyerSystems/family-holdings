-- Migration to add database functions and triggers for calculated fields
-- This ensures total_contributed and current_loan_balance are always accurate

-- Function to recalculate total_contributed for a user
CREATE OR REPLACE FUNCTION recalculate_user_totals(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update total_contributed based on paid contributions
  UPDATE profiles 
  SET total_contributed = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM contributions 
    WHERE contributions.user_id = recalculate_user_totals.user_id 
    AND status = 'paid'
  )
  WHERE id = user_id;
  
  -- Update current_loan_balance based on remaining loan balances
  UPDATE profiles 
  SET current_loan_balance = (
    SELECT COALESCE(SUM(remaining_balance), 0) 
    FROM loans 
    WHERE loans.user_id = recalculate_user_totals.user_id 
    AND status = 'active'
  )
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate all users
CREATE OR REPLACE FUNCTION recalculate_all_user_totals()
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM profiles LOOP
    PERFORM recalculate_user_totals(user_record.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for contribution changes
CREATE OR REPLACE FUNCTION trigger_recalculate_contributions()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM recalculate_user_totals(NEW.user_id);
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_user_totals(OLD.user_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for loan changes
CREATE OR REPLACE FUNCTION trigger_recalculate_loans()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM recalculate_user_totals(NEW.user_id);
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_user_totals(OLD.user_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for loan payments
CREATE OR REPLACE FUNCTION trigger_recalculate_loan_payments()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM recalculate_user_totals(NEW.user_id);
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_user_totals(OLD.user_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS contributions_recalculate_trigger ON contributions;
CREATE TRIGGER contributions_recalculate_trigger
  AFTER INSERT OR UPDATE OR DELETE ON contributions
  FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_contributions();

DROP TRIGGER IF EXISTS loans_recalculate_trigger ON loans;
CREATE TRIGGER loans_recalculate_trigger
  AFTER INSERT OR UPDATE OR DELETE ON loans
  FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_loans();

DROP TRIGGER IF EXISTS loan_payments_recalculate_trigger ON loan_payments;
CREATE TRIGGER loan_payments_recalculate_trigger
  AFTER INSERT OR UPDATE OR DELETE ON loan_payments
  FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_loan_payments();

-- Fix all existing data by recalculating totals
SELECT recalculate_all_user_totals();

-- Add a comment for documentation
COMMENT ON FUNCTION recalculate_user_totals(UUID) IS 'Recalculates total_contributed and current_loan_balance for a specific user';
COMMENT ON FUNCTION recalculate_all_user_totals() IS 'Recalculates totals for all users';
