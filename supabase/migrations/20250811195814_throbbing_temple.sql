/*
  # Système d'invitations sécurisé

  1. New Tables
    - `invitations`
      - `id` (uuid, primary key)
      - `from_user_id` (uuid, foreign key to users)
      - `to_email` (text)
      - `invite_code` (text)
      - `status` (text with check constraint)
      - `sent_at` (timestamp)
      - `accepted_at` (timestamp, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `invitations` table
    - Add policies for users to manage their own invitations

  3. Indexes
    - Index on from_user_id for performance
    - Index on invite_code for lookups
    - Index on status for filtering
*/

-- Créer la table invitations seulement si elle n'existe pas
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_email text NOT NULL,
  invite_code text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  sent_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Ajouter la contrainte de statut seulement si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'invitations_status_check' 
    AND table_name = 'invitations'
  ) THEN
    ALTER TABLE invitations 
    ADD CONSTRAINT invitations_status_check 
    CHECK (status = ANY (ARRAY['sent'::text, 'accepted'::text, 'declined'::text, 'expired'::text]));
  END IF;
END $$;

-- Activer RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Créer les politiques seulement si elles n'existent pas
DO $$
BEGIN
  -- Politique pour créer des invitations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invitations' 
    AND policyname = 'Users can create invitations'
  ) THEN
    CREATE POLICY "Users can create invitations"
      ON invitations
      FOR INSERT
      TO authenticated
      WITH CHECK (uid() = from_user_id);
  END IF;

  -- Politique pour voir ses invitations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invitations' 
    AND policyname = 'Users can view their invitations'
  ) THEN
    CREATE POLICY "Users can view their invitations"
      ON invitations
      FOR SELECT
      TO authenticated
      USING (uid() = from_user_id);
  END IF;

  -- Politique pour mettre à jour ses invitations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invitations' 
    AND policyname = 'Users can update their invitations'
  ) THEN
    CREATE POLICY "Users can update their invitations"
      ON invitations
      FOR UPDATE
      TO authenticated
      USING (uid() = from_user_id);
  END IF;
END $$;

-- Créer les index seulement s'ils n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_invitations_from_user_id'
  ) THEN
    CREATE INDEX idx_invitations_from_user_id ON invitations(from_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_invitations_invite_code'
  ) THEN
    CREATE INDEX idx_invitations_invite_code ON invitations(invite_code);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_invitations_status'
  ) THEN
    CREATE INDEX idx_invitations_status ON invitations(status);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_invitations_to_email'
  ) THEN
    CREATE INDEX idx_invitations_to_email ON invitations(to_email);
  END IF;
END $$;