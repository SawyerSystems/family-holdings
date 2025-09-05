-- Migration: Remove borrowing_limit column and standardize on borrow_limit_percent
-- Date: 2025-09-05

-- Remove the borrowing_limit column since we're standardizing on borrow_limit_percent
ALTER TABLE users DROP COLUMN IF EXISTS borrowing_limit;

-- Add a comment to the borrow_limit_percent column for clarity
COMMENT ON COLUMN users.borrow_limit_percent IS 'Borrowing limit as a percentage of total contributions (e.g., 75.0 for 75%)';
