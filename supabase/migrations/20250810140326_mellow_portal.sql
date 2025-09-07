/*
  # Ajouter les champs d'abonnement

  1. Modifications
    - Ajouter les champs Stripe à la table users_profiles
    - Ajouter les champs de gestion d'abonnement
    - Ajouter les champs d'essai gratuit

  2. Nouveaux champs
    - subscription_status: Statut de l'abonnement (active, canceled, etc.)
    - subscription_id: ID de l'abonnement Stripe
    - stripe_customer_id: ID du client Stripe
    - is_trial: Indique si l'utilisateur est en période d'essai
    - trial_end_date: Date de fin de l'essai gratuit
*/

-- Ajouter les colonnes d'abonnement à users_profiles
DO $$
BEGIN
  -- Statut de l'abonnement
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN subscription_status text DEFAULT 'inactive';
  END IF;

  -- ID de l'abonnement Stripe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN subscription_id text;
  END IF;

  -- ID du client Stripe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN stripe_customer_id text;
  END IF;

  -- Période d'essai active
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'is_trial'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN is_trial boolean DEFAULT true;
  END IF;

  -- Date de fin de l'essai
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'trial_end_date'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN trial_end_date timestamptz;
  END IF;

  -- Date de mise à jour
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Mettre à jour les utilisateurs existants avec une période d'essai
UPDATE users_profiles 
SET 
  is_trial = true,
  trial_end_date = created_at + interval '7 days',
  subscription_status = 'trialing'
WHERE trial_end_date IS NULL;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_users_profiles_subscription_status ON users_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_profiles_stripe_customer_id ON users_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_profiles_trial_end_date ON users_profiles(trial_end_date);