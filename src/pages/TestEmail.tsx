import { useState } from "react"

export default function TestEmail() {
  const [status, setStatus] = useState<string | null>(null)

  async function sendTestEmail() {
    setStatus("Envoi en cours...")

    try {
      const response = await fetch("/.netlify/functions/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "destinataire@example.com", // 🔹 change cet email pour tester
          subject: "Test depuis Co-Parents ✅",
          text: "Ceci est un email de test envoyé via Netlify Function + Nodemailer.",
        }),
      })

      const result = await response.json()
      if (result.success) {
        setStatus("✅ Email envoyé avec succès !")
      } else {
        setStatus("❌ Erreur: " + result.error)
      }
    } catch (err: any) {
      setStatus("❌ Exception: " + err.message)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Test d’envoi d’email</h1>
      <button onClick={sendTestEmail} className="bg-blue-600 text-white px-4 py-2 rounded">
        Envoyer un email de test
      </button>
      {status && <p className="mt-4">{status}</p>}
    </div>
  )
}
