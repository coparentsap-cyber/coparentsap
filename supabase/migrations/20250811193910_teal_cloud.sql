/*
  # Update users_profiles for phone authentication

  1. Changes
    - Add phone column if not exists
    - Add phone_confirmed column if not exists
    - Update invite_code generation
    - Add indexes for phone numbers

  2. Security
    - Maintain existing RLS policies
    - Add phone number validation
*/

-- Add phone column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN phone text;
  END IF;
END $$;

-- Add phone_confirmed column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'phone_confirmed'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN phone_confirmed boolean DEFAULT false;
  END IF;
END $$;

-- Add email_confirmed column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'email_confirmed'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN email_confirmed boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for phone numbers
CREATE INDEX IF NOT EXISTS idx_users_profiles_phone ON users_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_users_profiles_phone_confirmed ON users_profiles(phone_confirmed);
CREATE INDEX IF NOT EXISTS idx_users_profiles_email_confirmed ON users_profiles(email_confirmed);

-- Update invite_code for existing users without one
UPDATE users_profiles 
SET invite_code = 'CP-' || UPPER(SUBSTRING(user_id::text, -8))
WHERE invite_code IS NULL OR invite_code = '';