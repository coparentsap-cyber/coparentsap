/*
  # Fix users_profiles RLS policy

  1. Problem
    - Current RLS policy prevents new user profile creation
    - 401 error when inserting new rows in users_profiles table
    - Policy requires uid() = user_id but user_id should reference auth.users.id

  2. Solution
    - Drop existing problematic policies
    - Create new policies that properly handle user profile creation
    - Allow users to create and manage their own profiles using auth.uid()

  3. Security
    - Maintain RLS protection
    - Users can only access their own profile data
    - Proper foreign key relationship with auth.users
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Allow users to delete their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Policy_Select_UserProfile" ON users_profiles;

-- Create new, corrected policies for users_profiles
CREATE POLICY "Users can insert their own profile"
  ON users_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own profile"
  ON users_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON users_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON users_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);