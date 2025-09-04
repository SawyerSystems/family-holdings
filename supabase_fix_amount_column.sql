-- Fix for contributions table - Add missing amount column
-- Run this in Supabase SQL Editor BEFORE running the sample data

-- Add the missing amount column
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS amount numeric(10,2);

-- Set a default amount for any existing rows that don't have it
UPDATE contributions 
SET amount = 50.00 
WHERE amount IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE contributions 
ALTER COLUMN amount SET NOT NULL;

-- Verify the structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contributions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Contributions table amount column added successfully!' as status;
