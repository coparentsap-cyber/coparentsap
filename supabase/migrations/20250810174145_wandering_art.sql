/*
  # Création de la table documents

  1. Nouvelle table
    - `documents`
      - `id` (uuid, primary key)
      - `titre` (text)
      - `fichier_url` (text)
      - `fichier_nom` (text)
      - `fichier_taille` (bigint)
      - `fichier_type` (text)
      - `proprietaire_id` (uuid, foreign key vers auth.users)
      - `enfant_id` (uuid, foreign key vers enfants, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `documents`
    - Les utilisateurs peuvent voir/modifier uniquement leurs documents
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  fichier_url text NOT NULL,
  fichier_nom text NOT NULL,
  fichier_taille bigint,
  fichier_type text,
  proprietaire_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enfant_id uuid REFERENCES enfants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs voient uniquement leurs documents
CREATE POLICY "Users can view their own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = proprietaire_id);

CREATE POLICY "Users can insert their own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = proprietaire_id);

CREATE POLICY "Users can update their own documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = proprietaire_id)
  WITH CHECK (auth.uid() = proprietaire_id);

CREATE POLICY "Users can delete their own documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = proprietaire_id);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_documents_proprietaire_id ON documents(proprietaire_id);
CREATE INDEX IF NOT EXISTS idx_documents_enfant_id ON documents(enfant_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();