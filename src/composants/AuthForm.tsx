import { useState } from "react"
import { supabase } from "../lib/supabaseClient"
export default function AuthForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    setMsg(error ? `Erreur : ${error.message}` : "Lien envoyé ! Vérifie ta boîte mail.")
  }
  const out = async () => {
    await supabase.auth.signOut()
    setMsg("Déconnecté.")
  }
  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h2>Connexion par lien magique</h2>
      <form onSubmit={handle}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ton@email.com"
          required
          style={{ width: "100%", padding: 10, marginBottom: 8 }}
        />
        <button disabled={loading} type="submit" style={{ width: "100%", padding: 10 }}>
          {loading ? "Envoi…" : "Recevoir le lien magique"}
        </button>
      </form>
      <hr style={{ margin: "16px 0" }} />
      <button onClick={out} style={{ width: "100%", padding: 10 }}>
        Se déconnecter
      </button>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  )
}
