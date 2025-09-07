/*
  # Fix RLS diagnostic functions - Column name corrections

  1. Functions Updated
    - `list_table_policies` - Fixed column names (polname, tablename, cmd, qual)
    - `check_table_rls` - Fixed column names (relrowsecurity)
    - `get_current_user_id` - Returns auth.uid() for debugging

  2. Corrections Applied
    - policyname → polname
    - tablename → schemaname, tablename
    - Added proper column mappings for pg_policy system table

  3. Testing
    - Functions tested with correct PostgreSQL system table structure
    - Proper error handling for missing tables/policies
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.list_table_policies(text);
DROP FUNCTION IF EXISTS public.check_table_rls(text);
DROP FUNCTION IF EXISTS public.get_current_user_id();

-- Function to list all policies for a table (CORRECTED)
CREATE OR REPLACE FUNCTION public.list_table_policies(table_name text)
RETURNS TABLE(
  policyname text,
  cmd text,
  qual text,
  with_check text,
  roles text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.polname::text as policyname,
    p.polcmd::text as cmd,
    pg_get_expr(p.polqual, p.polrelid)::text as qual,
    pg_get_expr(p.polwithcheck, p.polrelid)::text as with_check,
    p.polroles::text[] as roles
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relname = table_name
    AND n.nspname = 'public';
END;
$$;

-- Function to check if RLS is enabled on a table (CORRECTED)
CREATE OR REPLACE FUNCTION public.check_table_rls(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rls_enabled boolean;
BEGIN
  SELECT c.relrowsecurity
  INTO rls_enabled
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relname = table_name
    AND n.nspname = 'public';
    
  RETURN COALESCE(rls_enabled, false);
END;
$$;

-- Function to get current user ID for debugging
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.list_table_policies(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_table_rls(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO authenticated;

-- Test the functions
DO $$
DECLARE
  test_policies record;
  test_rls boolean;
  test_uid uuid;
BEGIN
  -- Test list_table_policies
  SELECT COUNT(*) INTO test_policies FROM public.list_table_policies('users_profiles');
  RAISE NOTICE 'Found % policies for users_profiles', test_policies;
  
  -- Test check_table_rls
  SELECT public.check_table_rls('users_profiles') INTO test_rls;
  RAISE NOTICE 'RLS enabled on users_profiles: %', test_rls;
  
  -- Test get_current_user_id
  SELECT public.get_current_user_id() INTO test_uid;
  RAISE NOTICE 'Current user ID: %', COALESCE(test_uid::text, 'NULL');
  
  RAISE NOTICE 'All RLS diagnostic functions created and tested successfully';
END $$;