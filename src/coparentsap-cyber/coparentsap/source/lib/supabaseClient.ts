import { createClient } from '@supabase/supabase-js'

// On récupère les variables d'environnement définies dans Netlify
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Vérification pour éviter les erreurs si les variables ne sont pas définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Variables manquantes : VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY')
}

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
