-- Complete fix for missing amount columns in both contributions and loans tables
-- Run this in Supabase SQL Editor BEFORE running the sample data

-- Fix contributions table
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS amount numeric(10,2);

UPDATE contributions 
SET amount = 50.00 
WHERE amount IS NULL;

ALTER TABLE contributions 
ALTER COLUMN amount SET NOT NULL;

-- Fix loans table  
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS amount numeric(12,2);

UPDATE loans 
SET amount = COALESCE(remaining_balance, 500.00)
WHERE amount IS NULL;

ALTER TABLE loans 
ALTER COLUMN amount SET NOT NULL;

-- Verify both table structures
SELECT 'contributions' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contributions' AND table_schema = 'public'
AND column_name = 'amount'

UNION ALL

SELECT 'loans' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'loans' AND table_schema = 'public'
AND column_name = 'amount'
ORDER BY table_name;

SELECT 'Amount columns added to both contributions and loans tables!' as status;
