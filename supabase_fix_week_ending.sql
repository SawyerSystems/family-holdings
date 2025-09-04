-- Fix for contributions table week_ending column issue
-- Run this in Supabase SQL Editor BEFORE running the sample data

-- First, let's see what columns actually exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contributions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add week_ending column and calculate it from period_year/period_week if it doesn't exist
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS week_ending date;

-- For any existing or new rows, calculate week_ending from period_year and period_week
-- Week 1 starts on the first Monday of the year
CREATE OR REPLACE FUNCTION calculate_week_ending(year_val int, week_val int) 
RETURNS date AS $$
DECLARE
    first_monday date;
    week_ending_date date;
BEGIN
    -- Find the first Monday of the year
    first_monday := date_trunc('year', make_date(year_val, 1, 1))::date;
    WHILE extract(dow FROM first_monday) != 1 LOOP
        first_monday := first_monday + 1;
    END LOOP;
    
    -- Calculate the ending date of the specified week (Sunday)
    week_ending_date := first_monday + (week_val - 1) * 7 + 6;
    
    RETURN week_ending_date;
END;
$$ LANGUAGE plpgsql;

-- Update any rows that have period_year and period_week but missing week_ending
UPDATE contributions 
SET week_ending = calculate_week_ending(period_year, period_week)
WHERE week_ending IS NULL 
AND period_year IS NOT NULL 
AND period_week IS NOT NULL;

-- If there are still NULL week_ending values, set them to due_date
UPDATE contributions 
SET week_ending = due_date
WHERE week_ending IS NULL 
AND due_date IS NOT NULL;

-- If still NULL, set to current date
UPDATE contributions 
SET week_ending = CURRENT_DATE
WHERE week_ending IS NULL;

-- Now make week_ending NOT NULL if it isn't already
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE contributions ALTER COLUMN week_ending SET NOT NULL;
    EXCEPTION 
        WHEN others THEN 
            RAISE NOTICE 'week_ending column may already be NOT NULL or have other constraints';
    END;
END $$;

-- Drop the function as we don't need it anymore
DROP FUNCTION IF EXISTS calculate_week_ending(int, int);

SELECT 'Contributions table week_ending column fixed!' as status;
