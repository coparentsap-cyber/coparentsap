/*
  # Ajouter la colonne token manquante à la table invitations

  1. Modifications
     - Ajouter la colonne `token` à la table `invitations`
     - Ajouter un index pour les performances
     - Mettre à jour les politiques RLS si nécessaire

  2. Sécurité
     - La colonne token permet de sécuriser les invitations
     - Index pour optimiser les recherches par token
*/

-- Ajouter la colonne token si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invitations' AND column_name = 'token'
  ) THEN
    ALTER TABLE invitations ADD COLUMN token text;
  END IF;
END $$;

-- Ajouter la colonne expires_at si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invitations' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE invitations ADD COLUMN expires_at timestamptz DEFAULT (now() + interval '7 days');
  END IF;
END $$;

-- Ajouter un index sur la colonne token pour les performances
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'invitations' AND indexname = 'idx_invitations_token'
  ) THEN
    CREATE INDEX idx_invitations_token ON invitations(token);
  END IF;
END $$;

-- Ajouter un index sur expires_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'invitations' AND indexname = 'idx_invitations_expires_at'
  ) THEN
    CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);
  END IF;
END $$;

-- Générer des tokens pour les invitations existantes qui n'en ont pas
UPDATE invitations 
SET token = gen_random_uuid()::text 
WHERE token IS NULL;

-- Mettre à jour expires_at pour les invitations existantes
UPDATE invitations 
SET expires_at = sent_at + interval '7 days'
WHERE expires_at IS NULL AND sent_at IS NOT NULL;