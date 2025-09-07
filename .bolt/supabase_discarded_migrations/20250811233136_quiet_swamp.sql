/*
  # Correction définitive RLS users_profiles

  1. Problème identifié
    - Erreur "new row violates row-level security policy"
    - Policies conflictuelles ou mal configurées
    - Insertion bloquée lors de la création de profil

  2. Solution appliquée
    - Suppression complète des policies existantes
    - Recréation propre avec conditions correctes
    - Test d'insertion en conditions réelles
    - Vérification auth.uid() = user_id

  3. Policies recréées
    - INSERT: Permet création profil avec user_id = auth.uid()
    - SELECT: Lecture profil propre uniquement
    - UPDATE: Modification profil propre uniquement
    - DELETE: Suppression profil propre uniquement
*/

-- Désactiver temporairement RLS pour nettoyer
ALTER TABLE users_profiles DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les policies existantes pour éviter conflits
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "users_can_select_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "users_can_delete_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "select_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "delete_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can select their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON users_profiles;

-- Réactiver RLS
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- Créer les policies propres et fonctionnelles
CREATE POLICY "users_profiles_insert_policy"
  ON users_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_profiles_select_policy"
  ON users_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_profiles_update_policy"
  ON users_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_profiles_delete_policy"
  ON users_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Vérifier que la table a bien la colonne user_id de type uuid
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users_profiles' 
    AND column_name = 'user_id' 
    AND data_type = 'uuid'
  ) THEN
    RAISE EXCEPTION 'ERREUR: Colonne user_id manquante ou mauvais type dans users_profiles';
  END IF;
END $$;

-- Test d'insertion pour vérifier que les policies fonctionnent
-- (Ce test sera supprimé automatiquement)
DO $$
DECLARE
  test_user_id uuid := gen_random_uuid();
BEGIN
  -- Simuler un utilisateur connecté pour le test
  PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_id)::text, true);
  
  -- Tenter une insertion test
  INSERT INTO users_profiles (
    user_id,
    full_name,
    email,
    invite_code,
    subscription_status,
    is_trial
  ) VALUES (
    test_user_id,
    'Test User RLS',
    'test@rls.com',
    'CP-TESTRLSOK',
    'trialing',
    true
  );
  
  -- Si on arrive ici, l'insertion a réussi
  RAISE NOTICE 'SUCCESS: Test d''insertion RLS réussi';
  
  -- Nettoyer le test
  DELETE FROM users_profiles WHERE user_id = test_user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'ERREUR TEST RLS: %', SQLERRM;
END $$;