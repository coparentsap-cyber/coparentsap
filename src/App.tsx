import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabaseClient'
import AuthForm from './composants/AuthForm'
export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null); setChecking(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => { sub.subscription.unsubscribe() }
  }, [])
  const isCallback = window.location.pathname.startsWith('/auth/callback')
  if (isCallback) return (<div style={{padding:16}}>
    <h2>Connexion en cours…</h2><a href="/">Aller à l’accueil</a></div>)
  if (checking) return <p style={{padding:16}}>Chargement…</p>
  return (<div style={{padding:16}}>
    <h1>Co-Parents — Test Auth Supabase</h1>
    {session ? (<p>Connecté : <strong>{session.user.email}</strong></p>) : (<><AuthForm /><p style={{opacity:.7}}>Pas de session.</p></>)}
  </div>)
}
