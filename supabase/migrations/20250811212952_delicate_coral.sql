/*
  # Correction complète des politiques RLS et contraintes

  1. Corrections RLS
    - Suppression des politiques en doublon sur users_profiles
    - Création de politiques RLS correctes avec auth.uid()
    - Correction des politiques sur invitations

  2. Corrections contraintes
    - Gestion des contraintes existantes
    - Pas de recréation si elles existent déjà

  3. Sécurité
    - Chaque utilisateur ne peut gérer que ses propres données
    - Isolation complète entre familles
*/

-- Supprimer les anciennes politiques problématiques sur users_profiles
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

-- Créer les bonnes politiques RLS pour users_profiles
CREATE POLICY "users_can_select_own_profile" ON users_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_profile" ON users_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_profile" ON users_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_profile" ON users_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Vérifier et corriger les contraintes sur invitations
DO $$
BEGIN
  -- Vérifier si la contrainte status_check existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'invitations_status_check'
  ) THEN
    ALTER TABLE invitations 
    ADD CONSTRAINT invitations_status_check 
    CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text]));
  END IF;
END $$;

-- S'assurer que RLS est activé
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;