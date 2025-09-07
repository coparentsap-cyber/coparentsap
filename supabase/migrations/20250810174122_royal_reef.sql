/*
  # Création de la table enfants

  1. Nouvelle table
    - `enfants`
      - `id` (uuid, primary key)
      - `nom` (text)
      - `date_naissance` (date)
      - `allergies` (text)
      - `medecin` (text)
      - `photo_url` (text, nullable)
      - `parent_id` (uuid, foreign key vers auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `enfants`
    - Les parents peuvent voir/modifier uniquement leurs enfants
*/

CREATE TABLE IF NOT EXISTS enfants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  date_naissance date NOT NULL,
  allergies text DEFAULT '',
  medecin text DEFAULT '',
  photo_url text,
  parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE enfants ENABLE ROW LEVEL SECURITY;

-- Politique pour que les parents voient uniquement leurs enfants
CREATE POLICY "Parents can view their own children"
  ON enfants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert their own children"
  ON enfants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their own children"
  ON enfants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = parent_id)
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their own children"
  ON enfants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = parent_id);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_enfants_parent_id ON enfants(parent_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_enfants_updated_at
  BEFORE UPDATE ON enfants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();