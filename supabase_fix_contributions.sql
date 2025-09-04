-- Fix for existing contributions table
-- Run this BEFORE the main migration if you get "column does not exist" errors

-- Add missing columns to existing contributions table
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS period_year int,
ADD COLUMN IF NOT EXISTS period_week int,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS due_date date,
ADD COLUMN IF NOT EXISTS paid_at timestamptz,
ADD COLUMN IF NOT EXISTS method text,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update existing rows with calculated period_year and period_week if they're null
-- This assumes you have some date field to work from, adjust as needed
UPDATE contributions 
SET 
  period_year = CASE 
    WHEN period_year IS NULL AND created_at IS NOT NULL THEN EXTRACT(year FROM created_at)
    WHEN period_year IS NULL THEN EXTRACT(year FROM now())
    ELSE period_year
  END,
  period_week = CASE 
    WHEN period_week IS NULL AND created_at IS NOT NULL THEN EXTRACT(week FROM created_at)
    WHEN period_week IS NULL THEN EXTRACT(week FROM now())
    ELSE period_week
  END,
  due_date = CASE 
    WHEN due_date IS NULL AND created_at IS NOT NULL THEN created_at::date + interval '7 days'
    WHEN due_date IS NULL THEN now()::date + interval '7 days'
    ELSE due_date
  END
WHERE period_year IS NULL OR period_week IS NULL OR due_date IS NULL;

-- Now make the columns NOT NULL since they should all have values
ALTER TABLE contributions 
ALTER COLUMN period_year SET NOT NULL,
ALTER COLUMN period_week SET NOT NULL,
ALTER COLUMN due_date SET NOT NULL;

-- Add the unique constraint after ensuring data integrity
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_user_period' 
    AND conrelid = 'contributions'::regclass
  ) THEN
    ALTER TABLE contributions 
    ADD CONSTRAINT unique_user_period UNIQUE(user_id, period_year, period_week);
  END IF;
END $$;

SELECT 'Contributions table updated successfully!' as status;
