-- Fix for contributions status constraint issue
-- Run this in Supabase SQL Editor BEFORE running the sample data

-- First, check what the current status constraint allows
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'contributions'::regclass 
AND contype = 'c';

-- Check if we have enum types
SELECT typname FROM pg_type WHERE typname IN ('contribution_status', 'loan_status', 'user_role');

-- Create the enum types if they don't exist
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

-- If the status column is currently text with a constraint, we need to handle the conversion
DO $$ 
DECLARE
    col_type text;
BEGIN
    -- Check current status column type
    SELECT data_type INTO col_type 
    FROM information_schema.columns 
    WHERE table_name = 'contributions' 
    AND column_name = 'status' 
    AND table_schema = 'public';
    
    IF col_type = 'text' OR col_type = 'character varying' THEN
        RAISE NOTICE 'Status column is text type, will convert to enum';
        
        -- Drop existing check constraint if it exists
        BEGIN
            ALTER TABLE contributions DROP CONSTRAINT IF EXISTS contributions_status_check;
        EXCEPTION WHEN others THEN 
            RAISE NOTICE 'No status check constraint to drop';
        END;
        
        -- Update any non-standard values to match enum
        UPDATE contributions SET status = 'pending' WHERE status NOT IN ('pending','completed','late','missed');
        
        -- Remove the default constraint first, then convert column type, then re-add default
        ALTER TABLE contributions ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE contributions ALTER COLUMN status TYPE contribution_status USING status::contribution_status;
        ALTER TABLE contributions ALTER COLUMN status SET DEFAULT 'pending'::contribution_status;
        
    ELSIF col_type = 'USER-DEFINED' THEN
        RAISE NOTICE 'Status column is already an enum type';
    ELSE
        RAISE NOTICE 'Status column type: %', col_type;
    END IF;
END $$;

-- Verify the fix
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'contributions' 
AND column_name = 'status' 
AND table_schema = 'public';

-- Also fix loans table status column
DO $$ 
DECLARE
    col_type text;
BEGIN
    -- Check current status column type for loans
    SELECT data_type INTO col_type 
    FROM information_schema.columns 
    WHERE table_name = 'loans' 
    AND column_name = 'status' 
    AND table_schema = 'public';
    
    IF col_type = 'text' OR col_type = 'character varying' THEN
        RAISE NOTICE 'Loans status column is text type, will convert to enum';
        
        -- Drop existing check constraint if it exists
        BEGIN
            ALTER TABLE loans DROP CONSTRAINT IF EXISTS loans_status_check;
        EXCEPTION WHEN others THEN 
            RAISE NOTICE 'No loans status check constraint to drop';
        END;
        
        -- Update any non-standard values to match enum
        UPDATE loans SET status = 'pending' WHERE status NOT IN ('pending','approved','rejected','paid');
        
        -- Remove the default constraint first, then convert column type, then re-add default
        ALTER TABLE loans ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE loans ALTER COLUMN status TYPE loan_status USING status::loan_status;
        ALTER TABLE loans ALTER COLUMN status SET DEFAULT 'pending'::loan_status;
        
    ELSIF col_type = 'USER-DEFINED' THEN
        RAISE NOTICE 'Loans status column is already an enum type';
    ELSE
        RAISE NOTICE 'Loans status column type: %', col_type;
    END IF;
END $$;

-- Also fix profiles table role column
DO $$ 
DECLARE
    col_type text;
BEGIN
    -- Check current role column type for profiles
    SELECT data_type INTO col_type 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'role' 
    AND table_schema = 'public';
    
    IF col_type = 'text' OR col_type = 'character varying' THEN
        RAISE NOTICE 'Profiles role column is text type, will convert to enum';
        
        -- Update any non-standard values to match enum
        UPDATE profiles SET role = 'member' WHERE role NOT IN ('admin','member');
        
        -- Remove the default constraint first, then convert column type, then re-add default
        ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;
        ALTER TABLE profiles ALTER COLUMN role TYPE user_role USING role::user_role;
        ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'member'::user_role;
        
    ELSIF col_type = 'USER-DEFINED' THEN
        RAISE NOTICE 'Profiles role column is already an enum type';
    ELSE
        RAISE NOTICE 'Profiles role column type: %', col_type;
    END IF;
END $$;

SELECT 'All status and role columns fixed!' as status;
