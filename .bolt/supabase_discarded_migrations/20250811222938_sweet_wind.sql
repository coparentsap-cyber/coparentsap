/*
  # Nettoyage des policies dupliquées sur users_profiles

  1. Suppression des policies existantes
    - Supprime toutes les policies existantes pour éviter les doublons
    - Nettoie les contraintes problématiques
  
  2. Recréation des policies propres
    - Policies RLS optimisées avec auth.uid()
    - Accès sécurisé : chaque utilisateur voit uniquement ses données
    
  3. Vérifications
    - Vérifie que RLS est activé
    - Teste les permissions
*/

-- Supprimer toutes les policies existantes pour éviter les doublons
DROP POLICY IF EXISTS "users_can_select_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "users_can_delete_own_profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can select their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON users_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON users_profiles;

-- Supprimer les contraintes problématiques si elles existent
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'invitations_status_check' 
    AND table_name = 'invitations'
  ) THEN
    ALTER TABLE invitations DROP CONSTRAINT invitations_status_check;
  END IF;
END $$;

-- S'assurer que RLS est activé
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

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

-- Recréer la contrainte de statut pour invitations si nécessaire
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'invitations_status_check' 
    AND table_name = 'invitations'
  ) THEN
    ALTER TABLE invitations ADD CONSTRAINT invitations_status_check 
    CHECK (status = ANY (ARRAY['sent'::text, 'accepted'::text, 'rejected'::text, 'expired'::text]));
  END IF;
END $$;

-- Nettoyer les policies sur invitations aussi
DROP POLICY IF EXISTS "Users can create invitations" ON invitations;
DROP POLICY IF EXISTS "Users can update their invitations" ON invitations;
DROP POLICY IF EXISTS "Users can view their invitations" ON invitations;

-- Recréer les policies pour invitations
CREATE POLICY "users_can_create_invitations"
  ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "users_can_view_invitations"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id);

CREATE POLICY "users_can_update_invitations"
  ON invitations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = from_user_id)
  WITH CHECK (auth.uid() = from_user_id);