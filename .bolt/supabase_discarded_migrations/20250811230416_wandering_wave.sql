/*
  # Nettoyage et recréation des policies RLS - users_profiles

  1. Suppression de toutes les policies existantes
  2. Recréation des policies principales
  3. Vérification RLS activé
  4. Test des règles d'accès

  IMPORTANT: Cette migration nettoie complètement les policies pour éviter les conflits
*/

-- 1. Supprimer TOUTES les policies existantes sur users_profiles
DROP POLICY IF EXISTS "Users can delete their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can select their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON users_profiles;
DROP POLICY IF EXISTS "users_can_delete_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "users_can_select_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON users_profiles;

-- 2. S'assurer que RLS est activé
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Recréer les policies principales avec auth.uid()

-- Policy SELECT: Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "users_can_view_own_profile"
  ON users_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy INSERT: Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "users_can_create_own_profile"
  ON users_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy UPDATE: Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "users_can_modify_own_profile"
  ON users_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy DELETE: Les utilisateurs peuvent supprimer leur propre profil
CREATE POLICY "users_can_remove_own_profile"
  ON users_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Vérifier que les policies sont bien créées
DO $$
BEGIN
  -- Vérifier que les 4 policies existent
  IF (
    SELECT COUNT(*) 
    FROM pg_policies 
    WHERE tablename = 'users_profiles' 
    AND schemaname = 'public'
  ) = 4 THEN
    RAISE NOTICE 'SUCCESS: 4 policies RLS créées sur users_profiles';
  ELSE
    RAISE EXCEPTION 'ERREUR: Policies RLS non créées correctement';
  END IF;
END $$;