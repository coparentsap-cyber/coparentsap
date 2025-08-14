import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    setLoading(false)
    setMessage(error ? `Erreur : ${error.message}` : 'Lien envoyé ! Vérifie ta boîte mail.')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMessage('Tu es déconnecté.')
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h2>Connexion par lien magique</h2>
      <form onSubmit={handleMagicLink}>
        <input
          type="email"
          placeholder="ton@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 8 }}
        />
        <button disabled={loading} type="submit" style={{ width: '100%', padding: 10 }}>
          {loading ? 'Envoi…' : 'Recevoir le lien magique'}
        </button>
      </form>

      <hr style={{ margin: '16px 0' }} />

      <button onClick={handleSignOut} style={{ width: '100%', padding: 10 }}>
        Se déconnecter
      </button>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  )
}
