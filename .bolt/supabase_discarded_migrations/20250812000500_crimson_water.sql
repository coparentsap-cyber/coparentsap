/*
  # Fonctions de diagnostic email et RLS

  1. Fonctions de diagnostic
    - `test_email_configuration()` - Teste la configuration email
    - `get_email_logs()` - Récupère les logs d'emails
    - `verify_rls_policies()` - Vérifie les policies RLS
  
  2. Fonctions utilitaires
    - `generate_invite_code()` - Génère un code d'invitation unique
    - `cleanup_expired_invitations()` - Nettoie les invitations expirées
*/

-- Fonction pour tester la configuration email
CREATE OR REPLACE FUNCTION test_email_configuration()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  resend_key text;
  from_email text;
BEGIN
  -- Récupérer les variables d'environnement
  resend_key := current_setting('app.settings.resend_api_key', true);
  from_email := current_setting('app.settings.from_email', true);
  
  -- Construire le résultat
  result := jsonb_build_object(
    'resend_api_key_configured', CASE WHEN resend_key IS NOT NULL AND resend_key != '' THEN true ELSE false END,
    'from_email_configured', CASE WHEN from_email IS NOT NULL AND from_email != '' THEN true ELSE false END,
    'timestamp', now()
  );
  
  RETURN result;
END;
$$;

-- Fonction pour vérifier les policies RLS
CREATE OR REPLACE FUNCTION verify_rls_policies(table_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  rls_enabled boolean;
  policies_count integer;
BEGIN
  -- Vérifier si RLS est activé
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relname = table_name AND n.nspname = 'public';
  
  -- Compter les policies
  SELECT COUNT(*) INTO policies_count
  FROM pg_policy p
  JOIN pg_class c ON c.oid = p.polrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relname = table_name AND n.nspname = 'public';
  
  result := jsonb_build_object(
    'table_name', table_name,
    'rls_enabled', COALESCE(rls_enabled, false),
    'policies_count', COALESCE(policies_count, 0),
    'timestamp', now()
  );
  
  RETURN result;
END;
$$;

-- Fonction pour générer un code d'invitation unique
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists_check boolean;
BEGIN
  LOOP
    -- Générer un code aléatoire
    code := 'CP-' || upper(substring(gen_random_uuid()::text from 1 for 8));
    
    -- Vérifier s'il existe déjà
    SELECT EXISTS(
      SELECT 1 FROM users_profiles WHERE invite_code = code
    ) INTO exists_check;
    
    -- Si unique, sortir de la boucle
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Fonction pour nettoyer les invitations expirées
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM invitations 
  WHERE expires_at < now() 
  AND status = 'sent';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION test_email_configuration() TO authenticated;
GRANT EXECUTE ON FUNCTION verify_rls_policies(text) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invite_code() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_invitations() TO authenticated;