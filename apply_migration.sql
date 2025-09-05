-- Apply Migration: Remove borrowing_limit column
-- This migration removes the redundant borrowing_limit column from the users table
-- and standardizes on borrow_limit_percent for configurable borrowing limits

-- Step 1: Remove the borrowing_limit column (this is now calculated dynamically)
ALTER TABLE users DROP COLUMN IF EXISTS borrowing_limit;

-- Step 2: Add a helpful comment to the borrow_limit_percent column
COMMENT ON COLUMN users.borrow_limit_percent IS 'Borrowing limit as a percentage of total contributions (e.g., 75.0 for 75%). Used to calculate dynamic borrowing limits.';

-- Step 3: Verify the change by checking the table structure
-- Run this query to verify the column was removed:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;
