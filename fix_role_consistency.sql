-- Fix role consistency between users and profiles tables
-- The users table has a constraint allowing 'user' and 'admin'
-- The profiles table has a constraint allowing 'member' and 'admin'  
-- We need to standardize on 'member' and 'admin'

-- First, let's see what constraint exists on the users table
DO $$
BEGIN
    -- Check if there's a check constraint on the users.role column
    IF EXISTS (
        SELECT 1 FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        WHERE rel.relname = 'users' 
        AND con.contype = 'c'
        AND con.consrc LIKE '%role%'
    ) THEN
        -- Drop the existing check constraint
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT users_role_check';
        RAISE NOTICE 'Dropped existing role check constraint on users table';
    END IF;
    
    -- Add new check constraint allowing 'admin' and 'member'
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'member'));
    RAISE NOTICE 'Added new role check constraint allowing admin and member';
    
    -- Update 'user' roles to 'member' in users table
    UPDATE users SET role = 'member' WHERE role = 'user';
    RAISE NOTICE 'Updated user roles from user to member';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$;
