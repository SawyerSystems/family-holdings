-- Fix for existing loans table
-- Run this BEFORE the main migration if you get "column does not exist" errors for loans

-- Add missing columns to existing loans table
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS reason text,
ADD COLUMN IF NOT EXISTS duration_weeks int DEFAULT 12,
ADD COLUMN IF NOT EXISTS weekly_payment numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_balance numeric(12,2),
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update existing rows with calculated values
UPDATE loans 
SET 
  remaining_balance = CASE 
    WHEN remaining_balance IS NULL THEN amount
    ELSE remaining_balance
  END,
  weekly_payment = CASE 
    WHEN weekly_payment = 0 AND duration_weeks > 0 THEN amount / duration_weeks
    WHEN weekly_payment = 0 THEN amount / 12  -- default to 12 weeks
    ELSE weekly_payment
  END
WHERE remaining_balance IS NULL OR weekly_payment = 0;

-- Make critical columns NOT NULL
ALTER TABLE loans 
ALTER COLUMN duration_weeks SET NOT NULL,
ALTER COLUMN weekly_payment SET NOT NULL,
ALTER COLUMN remaining_balance SET NOT NULL;

SELECT 'Loans table updated successfully!' as status;
