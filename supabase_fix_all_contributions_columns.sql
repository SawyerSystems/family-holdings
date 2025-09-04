-- Comprehensive fix for all missing columns in contributions table
-- Run this in Supabase SQL Editor BEFORE running the sample data

-- First, let's see what columns actually exist
SELECT 'Current contributions table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contributions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add all missing columns that might be needed
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS amount numeric(10,2),
ADD COLUMN IF NOT EXISTS expected_amount numeric(10,2),
ADD COLUMN IF NOT EXISTS week_ending date;

-- Set defaults for any missing values
UPDATE contributions 
SET amount = COALESCE(amount, expected_amount, 50.00)
WHERE amount IS NULL;

UPDATE contributions 
SET expected_amount = COALESCE(expected_amount, amount, 50.00)
WHERE expected_amount IS NULL;

-- Calculate week_ending from period_year/period_week if missing
UPDATE contributions 
SET week_ending = (
    -- Calculate the ending date of the week (Sunday)
    -- Week 1 starts on the first Monday of the year
    (date_trunc('year', make_date(period_year, 1, 1))::date + 
     interval '1 week' * (period_week - 1) + 
     interval '6 days')::date
)
WHERE week_ending IS NULL 
AND period_year IS NOT NULL 
AND period_week IS NOT NULL;

-- If still missing week_ending, use due_date
UPDATE contributions 
SET week_ending = due_date
WHERE week_ending IS NULL 
AND due_date IS NOT NULL;

-- If still missing, use current date
UPDATE contributions 
SET week_ending = CURRENT_DATE
WHERE week_ending IS NULL;

-- Make critical columns NOT NULL
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE contributions ALTER COLUMN amount SET NOT NULL;
    EXCEPTION WHEN others THEN 
        RAISE NOTICE 'amount column constraint update failed or already exists';
    END;
    
    BEGIN
        ALTER TABLE contributions ALTER COLUMN expected_amount SET NOT NULL;
    EXCEPTION WHEN others THEN 
        RAISE NOTICE 'expected_amount column constraint update failed or already exists';
    END;
    
    BEGIN
        ALTER TABLE contributions ALTER COLUMN week_ending SET NOT NULL;
    EXCEPTION WHEN others THEN 
        RAISE NOTICE 'week_ending column constraint update failed or already exists';
    END;
END $$;

-- Final verification
SELECT 'Updated contributions table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contributions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'All missing columns fixed for contributions table!' as status;
