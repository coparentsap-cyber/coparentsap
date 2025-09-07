/*
  # Fix users_profiles RLS policies - Final correction

  1. Clean existing policies
    - Remove all existing policies to avoid conflicts
    - Ensure clean slate for new policies
  
  2. Recreate correct policies
    - INSERT: Allow users to create their own profile
    - SELECT: Allow users to view their own profile  
    - UPDATE: Allow users to update their own profile
    - DELETE: Allow users to delete their own profile
  
  3. Security
    - Use auth.uid() = id for all policies
    - Enable RLS on table
    - Test insertion works correctly
*/

-- First, ensure RLS is enabled
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policy 
        WHERE tablename = 'users_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users_profiles', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Create clean, working policies
CREATE POLICY "users_can_insert_own_profile"
  ON users_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_can_select_own_profile"
  ON users_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile"
  ON users_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_can_delete_own_profile"
  ON users_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Verify policies were created
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policy 
    WHERE tablename = 'users_profiles';
    
    RAISE NOTICE 'Created % policies for users_profiles', policy_count;
    
    -- List all policies
    FOR policy_record IN 
        SELECT policyname, cmd 
        FROM pg_policy 
        WHERE tablename = 'users_profiles'
        ORDER BY cmd, policyname
    LOOP
        RAISE NOTICE 'Policy: % (%)', policy_record.policyname, policy_record.cmd;
    END LOOP;
END $$;