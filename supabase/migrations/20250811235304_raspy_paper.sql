/*
  # Create RLS diagnostic functions

  1. New Functions
    - `list_table_policies` - Lists all policies for a given table
    - `check_table_rls` - Checks if RLS is enabled for a table
  
  2. Purpose
    - Enable RLS diagnostic panel functionality
    - Allow programmatic policy verification
    - Support automated RLS testing
*/

-- Function to list all policies for a table
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
    p.policyname::text,
    p.cmd::text,
    p.qual::text,
    p.with_check::text,
    p.roles
  FROM pg_policy p
  WHERE p.tablename = table_name;
END;
$$;

-- Function to check if RLS is enabled for a table
CREATE OR REPLACE FUNCTION public.check_table_rls(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rls_enabled boolean;
BEGIN
  SELECT relrowsecurity INTO rls_enabled 
  FROM pg_class 
  WHERE relname = table_name;
  
  RETURN COALESCE(rls_enabled, false);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.list_table_policies(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_table_rls(text) TO authenticated;