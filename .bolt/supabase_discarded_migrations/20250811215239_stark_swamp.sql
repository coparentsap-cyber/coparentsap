/*
  # Vérification et correction du schéma invitations

  1. Vérification de la structure
    - Vérifier que la table invitations existe
    - Vérifier les colonnes existantes
    - Corriger les références incorrectes

  2. Nettoyage
    - Supprimer les politiques en double
    - Corriger les contraintes
*/

-- Vérifier la structure actuelle de la table invitations
DO $$
BEGIN
  -- Afficher les colonnes existantes
  RAISE NOTICE 'Colonnes de la table invitations:';
  
  -- Vérifier si la colonne token existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invitations' AND column_name = 'token'
  ) THEN
    RAISE NOTICE 'Colonne token: EXISTE';
  ELSE
    RAISE NOTICE 'Colonne token: N''EXISTE PAS';
  END IF;
  
  -- Vérifier si la colonne invite_code existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invitations' AND column_name = 'invite_code'
  ) THEN
    RAISE NOTICE 'Colonne invite_code: EXISTE';
  ELSE
    RAISE NOTICE 'Colonne invite_code: N''EXISTE PAS';
  END IF;
END $$;

-- Nettoyer les politiques en double sur invitations
DROP POLICY IF EXISTS "Users can create invitations" ON invitations;
DROP POLICY IF EXISTS "Users can update their invitations" ON invitations;
DROP POLICY IF EXISTS "Users can view their invitations" ON invitations;

-- Recréer les politiques proprement
CREATE POLICY "Users can create invitations"
  ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view their invitations"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id);

CREATE POLICY "Users can update their invitations"
  ON invitations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = from_user_id)
  WITH CHECK (auth.uid() = from_user_id);

-- Corriger la contrainte de statut si elle pose problème
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'invitations_status_check'
  ) THEN
    ALTER TABLE invitations DROP CONSTRAINT invitations_status_check;
  END IF;
END $$;

-- Recréer la contrainte avec les bons statuts
ALTER TABLE invitations 
ADD CONSTRAINT invitations_status_check 
CHECK (status = ANY (ARRAY['sent'::text, 'accepted'::text, 'rejected'::text, 'expired'::text]));