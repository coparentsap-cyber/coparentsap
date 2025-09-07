/*
  # Fix constraint duplicates - Final solution

  1. Clean existing constraints safely
  2. Recreate invitations table properly
  3. Add all constraints with IF NOT EXISTS logic
  4. Enable RLS and policies
*/

-- Supprimer la contrainte problématique si elle existe
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

-- Supprimer d'autres contraintes potentiellement dupliquées
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'notifications_type_check' 
    AND table_name = 'notifications'
  ) THEN
    ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'coparent_connections_status_check' 
    AND table_name = 'coparent_connections'
  ) THEN
    ALTER TABLE coparent_connections DROP CONSTRAINT coparent_connections_status_check;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'documents_statut_check' 
    AND table_name = 'documents'
  ) THEN
    ALTER TABLE documents DROP CONSTRAINT documents_statut_check;
  END IF;
END $$;

-- Créer la table invitations si elle n'existe pas
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_email text NOT NULL,
  invite_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Ajouter les contraintes de manière sécurisée
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'invitations_status_check' 
    AND table_name = 'invitations'
  ) THEN
    ALTER TABLE invitations 
    ADD CONSTRAINT invitations_status_check 
    CHECK (status IN ('pending', 'accepted', 'rejected'));
  END IF;
END $$;

-- Ajouter les autres contraintes manquantes de manière sécurisée
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'notifications_type_check' 
    AND table_name = 'notifications'
  ) THEN
    ALTER TABLE notifications 
    ADD CONSTRAINT notifications_type_check 
    CHECK (type IN ('planning', 'document', 'photo', 'message', 'validation', 'invitation'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'coparent_connections_status_check' 
    AND table_name = 'coparent_connections'
  ) THEN
    ALTER TABLE coparent_connections 
    ADD CONSTRAINT coparent_connections_status_check 
    CHECK (status IN ('pending', 'connected', 'blocked'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'documents_statut_check' 
    AND table_name = 'documents'
  ) THEN
    ALTER TABLE documents 
    ADD CONSTRAINT documents_statut_check 
    CHECK (statut IN ('en_attente', 'valide', 'refuse'));
  END IF;
END $$;

-- Activer RLS sur invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour invitations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invitations' 
    AND policyname = 'Users can create invitations'
  ) THEN
    CREATE POLICY "Users can create invitations"
      ON invitations
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = from_user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invitations' 
    AND policyname = 'Users can view their invitations'
  ) THEN
    CREATE POLICY "Users can view their invitations"
      ON invitations
      FOR SELECT
      TO authenticated
      USING (auth.uid() = from_user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invitations' 
    AND policyname = 'Users can update their invitations'
  ) THEN
    CREATE POLICY "Users can update their invitations"
      ON invitations
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = from_user_id);
  END IF;
END $$;

-- Créer les index pour performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'invitations' 
    AND indexname = 'idx_invitations_from_user_id'
  ) THEN
    CREATE INDEX idx_invitations_from_user_id ON invitations(from_user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'invitations' 
    AND indexname = 'idx_invitations_to_email'
  ) THEN
    CREATE INDEX idx_invitations_to_email ON invitations(to_email);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'invitations' 
    AND indexname = 'idx_invitations_invite_code'
  ) THEN
    CREATE INDEX idx_invitations_invite_code ON invitations(invite_code);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'invitations' 
    AND indexname = 'idx_invitations_status'
  ) THEN
    CREATE INDEX idx_invitations_status ON invitations(status);
  END IF;
END $$;