/*
  # Correction finale des politiques RLS pour users_profiles

  1. Suppression des politiques en doublon
  2. Création de politiques RLS propres et sécurisées
  3. Correction des contraintes
  4. Optimisation des index
*/

-- Supprimer toutes les politiques existantes pour repartir proprement
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

-- S'assurer que RLS est activé
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS finales et propres
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

-- Vérifier et créer les index nécessaires s'ils n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'users_profiles' AND indexname = 'idx_users_profiles_user_id'
  ) THEN
    CREATE INDEX idx_users_profiles_user_id ON users_profiles(user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'users_profiles' AND indexname = 'idx_users_profiles_invite_code_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_users_profiles_invite_code_unique ON users_profiles(invite_code);
  END IF;
END $$;

-- Corriger la contrainte de statut d'abonnement si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'users_profiles_subscription_status_check'
  ) THEN
    ALTER TABLE users_profiles 
    ADD CONSTRAINT users_profiles_subscription_status_check 
    CHECK (subscription_status IN ('trialing', 'active', 'inactive', 'canceled'));
  END IF;
END $$;