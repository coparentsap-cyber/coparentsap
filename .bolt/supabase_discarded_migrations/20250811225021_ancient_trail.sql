/*
  # Nettoyage complet des policies RLS sur users_profiles

  1. Suppression de toutes les policies existantes
  2. Recréation propre des policies nécessaires
  3. Correction des contraintes dupliquées
  4. Optimisation des index
*/

-- Supprimer toutes les policies existantes pour éviter les doublons
DROP POLICY IF EXISTS "Users can delete their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can select their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON users_profiles;
DROP POLICY IF EXISTS "users_can_delete_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "users_can_select_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON users_profiles;

-- Supprimer les contraintes dupliquées si elles existent
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_user_profile' 
    AND table_name = 'users_profiles'
  ) THEN
    ALTER TABLE users_profiles DROP CONSTRAINT unique_user_profile;
  END IF;
END $$;

-- Recréer les policies proprement
CREATE POLICY "users_can_select_own_profile"
  ON users_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_profile"
  ON users_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_profile"
  ON users_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_profile"
  ON users_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Recréer la contrainte unique si nécessaire
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_profiles_user_id_key' 
    AND table_name = 'users_profiles'
  ) THEN
    ALTER TABLE users_profiles ADD CONSTRAINT users_profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Optimiser les index
CREATE INDEX IF NOT EXISTS idx_users_profiles_user_id ON users_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_users_profiles_invite_code ON users_profiles(invite_code);
CREATE INDEX IF NOT EXISTS idx_users_profiles_email ON users_profiles(email);

-- Vérifier que RLS est activé
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;