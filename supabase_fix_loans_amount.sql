-- Check loans table structure and add missing amount column if needed
-- Run this in Supabase SQL Editor

-- Add the missing amount column for loans
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS amount numeric(12,2);

-- Set a default amount for any existing rows that don't have it
UPDATE loans 
SET amount = remaining_balance 
WHERE amount IS NULL AND remaining_balance IS NOT NULL;

UPDATE loans 
SET amount = 500.00 
WHERE amount IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE loans 
ALTER COLUMN amount SET NOT NULL;

-- Verify the structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'loans' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Loans table amount column added successfully!' as status;
