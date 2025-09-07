/*
  # Nettoyage des politiques RLS dupliquées

  1. Suppression des politiques en double
  2. Recréation des politiques propres
  3. Vérification des contraintes
*/

-- Supprimer toutes les politiques existantes sur users_profiles
DROP POLICY IF EXISTS "Allow authenticated users to insert their profile" ON users_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their profile" ON users_profiles;
DROP POLICY IF EXISTS "Allow users to delete their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Policy_Select_UserProfile" ON users_profiles;
DROP POLICY IF EXISTS "Test insert profiles" ON users_profiles;
DROP POLICY IF EXISTS "Test update profiles" ON users_profiles;
DROP POLICY IF EXISTS "delete_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "select_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON users_profiles;

-- Recréer les politiques propres
CREATE POLICY "users_can_select_own_profile"
  ON users_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_can_insert_own_profile"
  ON users_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

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

-- Vérifier les contraintes sur invitations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'invitations' AND constraint_name = 'invitations_status_check'
  ) THEN
    ALTER TABLE invitations ADD CONSTRAINT invitations_status_check 
    CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text]));
  END IF;
END $$;