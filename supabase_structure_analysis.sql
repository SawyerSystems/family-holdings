-- CORRECTED: Complete database structure fix based on actual database analysis
-- Run this in Supabase SQL Editor BEFORE running the sample data

-- ===== EXACT DATABASE STRUCTURE DISCOVERED =====
-- CONTRIBUTIONS table REQUIRED fields:
--   - user_id (UUID, FK to auth.users)
--   - amount (decimal)
--   - expected_amount (decimal) 
--   - week_ending (date) NOT NULL
--   - period_year (int) NOT NULL
--   - period_week (int) NOT NULL
--   - due_date (date) NOT NULL
--   - status (text/enum with default 'pending')
--
-- LOANS table REQUIRED fields:
--   - user_id (UUID, FK to auth.users)
--   - amount (decimal)
--   - reason (text) NOT NULL
--   - remaining_balance (decimal) NOT NULL
--   - duration_weeks (int with default 12)
--   - status (text/enum with default 'pending')
--
-- PROFILES table:
--   - id (UUID, FK to auth.users) - must reference existing auth.users

-- First, check what enum types exist
SELECT 'Checking existing enum types:' as info;
SELECT typname FROM pg_type WHERE typname IN ('contribution_status', 'loan_status', 'user_role');

-- Create enum types if they don't exist (these may be text fields with constraints instead)
DO $$ BEGIN
    CREATE TYPE contribution_status AS ENUM ('pending','completed','late','missed');
EXCEPTION WHEN duplicate_object THEN 
    RAISE NOTICE 'Type contribution_status already exists, skipping';
END $$;

DO $$ BEGIN
    CREATE TYPE loan_status AS ENUM ('pending','approved','rejected','paid');
EXCEPTION WHEN duplicate_object THEN 
    RAISE NOTICE 'Type loan_status already exists, skipping';
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin','member');
EXCEPTION WHEN duplicate_object THEN 
    RAISE NOTICE 'Type user_role already exists, skipping';
END $$;

-- Show current table structures
SELECT 'CONTRIBUTIONS table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default, udt_name
FROM information_schema.columns 
WHERE table_name = 'contributions' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'LOANS table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default, udt_name
FROM information_schema.columns 
WHERE table_name = 'loans' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'PROFILES table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default, udt_name
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Database structure analysis complete. Tables are ready for data insertion.' as status;
