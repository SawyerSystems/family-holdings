-- Fix for contributions table expected_amount column issue
-- Run this in Supabase SQL Editor BEFORE running the sample data

-- First, let's see what columns actually exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contributions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add expected_amount column if it doesn't exist
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS expected_amount numeric(10,2);

-- Set expected_amount to match amount for existing rows
UPDATE contributions 
SET expected_amount = amount
WHERE expected_amount IS NULL 
AND amount IS NOT NULL;

-- For any rows still missing expected_amount, set a default
UPDATE contributions 
SET expected_amount = 50.00
WHERE expected_amount IS NULL;

-- Make the column NOT NULL
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE contributions ALTER COLUMN expected_amount SET NOT NULL;
    EXCEPTION 
        WHEN others THEN 
            RAISE NOTICE 'expected_amount column may already be NOT NULL or have other constraints';
    END;
END $$;

SELECT 'Contributions table expected_amount column fixed!' as status;
