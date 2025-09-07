/*
  # Mise à jour table documents

  1. Nouvelles colonnes
    - `validation_requise` (boolean) - Document nécessite validation
    - `valide_par` (uuid) - Utilisateur qui a validé
    - `statut` (text) - Statut du document

  2. Sécurité
    - Mise à jour des politiques RLS
*/

DO $$
BEGIN
  -- Ajouter colonne validation_requise si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'validation_requise'
  ) THEN
    ALTER TABLE documents ADD COLUMN validation_requise boolean DEFAULT false;
  END IF;

  -- Ajouter colonne valide_par si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'valide_par'
  ) THEN
    ALTER TABLE documents ADD COLUMN valide_par uuid REFERENCES auth.users(id);
  END IF;

  -- Ajouter colonne statut si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'statut'
  ) THEN
    ALTER TABLE documents ADD COLUMN statut text DEFAULT 'valide' CHECK (statut IN ('en_attente', 'valide', 'refuse'));
  END IF;
END $$;

-- Mettre à jour la politique de lecture pour inclure les co-parents
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;

CREATE POLICY "Users can view their documents and coparents documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = proprietaire_id OR
    EXISTS (
      SELECT 1 FROM coparent_connections 
      WHERE (user_id = auth.uid() AND coparent_id = proprietaire_id)
         OR (coparent_id = auth.uid() AND user_id = proprietaire_id)
      AND status = 'connected'
    )
  );

-- Politique pour valider les documents des co-parents
CREATE POLICY "Coparents can validate documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coparent_connections 
      WHERE (user_id = auth.uid() AND coparent_id = proprietaire_id)
         OR (coparent_id = auth.uid() AND user_id = proprietaire_id)
      AND status = 'connected'
    )
  );

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_documents_statut ON documents(statut);
CREATE INDEX IF NOT EXISTS idx_documents_validation_requise ON documents(validation_requise);