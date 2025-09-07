/*
  # Création de la table dépenses

  1. Nouvelle table
    - `depenses`
      - `id` (uuid, primary key)
      - `montant` (decimal)
      - `description` (text)
      - `date_depense` (date)
      - `payeur_id` (uuid, foreign key vers auth.users)
      - `enfant_id` (uuid, foreign key vers enfants)
      - `justificatif_url` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `depenses`
    - Les parents peuvent voir/modifier uniquement leurs dépenses
*/

CREATE TABLE IF NOT EXISTS depenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  montant decimal(10,2) NOT NULL,
  description text NOT NULL,
  date_depense date NOT NULL,
  payeur_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enfant_id uuid REFERENCES enfants(id) ON DELETE CASCADE,
  justificatif_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE depenses ENABLE ROW LEVEL SECURITY;

-- Politique pour que les parents voient uniquement leurs dépenses
CREATE POLICY "Users can view their own expenses"
  ON depenses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = payeur_id);

CREATE POLICY "Users can insert their own expenses"
  ON depenses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = payeur_id);

CREATE POLICY "Users can update their own expenses"
  ON depenses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = payeur_id)
  WITH CHECK (auth.uid() = payeur_id);

CREATE POLICY "Users can delete their own expenses"
  ON depenses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = payeur_id);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_depenses_payeur_id ON depenses(payeur_id);
CREATE INDEX IF NOT EXISTS idx_depenses_enfant_id ON depenses(enfant_id);
CREATE INDEX IF NOT EXISTS idx_depenses_date ON depenses(date_depense DESC);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_depenses_updated_at
  BEFORE UPDATE ON depenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();