/*
  # Correction policy INSERT pour users_profiles

  1. Problème identifié
    - Policy INSERT trop restrictive empêchant création profils
    - Erreur "new row violates row-level security policy"
    
  2. Solution
    - Corriger la policy INSERT pour permettre création avec auth.uid()
    - Vérifier que l'utilisateur peut créer son propre profil
    
  3. Sécurité
    - Maintenir l'isolation entre utilisateurs
    - Permettre uniquement création de son propre profil
*/

-- Supprimer la policy INSERT problématique
DROP POLICY IF EXISTS "users_can_create_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users_profiles;

-- Recréer la policy INSERT correcte
CREATE POLICY "users_can_insert_own_profile"
  ON users_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Vérifier que RLS est activé
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- Vérifier les autres policies (sans les recréer si elles existent)
DO $$
BEGIN
  -- Policy SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users_profiles' 
    AND policyname = 'users_can_select_own_profile'
  ) THEN
    CREATE POLICY "users_can_select_own_profile"
      ON users_profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Policy UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users_profiles' 
    AND policyname = 'users_can_update_own_profile'
  ) THEN
    CREATE POLICY "users_can_update_own_profile"
      ON users_profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users_profiles' 
    AND policyname = 'users_can_delete_own_profile'
  ) THEN
    CREATE POLICY "users_can_delete_own_profile"
      ON users_profiles
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;