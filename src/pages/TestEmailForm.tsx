import { useState } from "react";

export default function TestEmailForm() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Envoi en cours...");

    try {
      const response = await fetch("/.netlify/functions/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, text }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus("✅ Email envoyé avec succès !");
      } else {
        setStatus("❌ Erreur: " + result.error);
      }
    } catch (err: any) {
      setStatus("❌ Exception: " + err.message);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Envoyer un email</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80 border p-4 rounded shadow">
        <input
          type="email"
          placeholder="Destinataire"
          className="border p-2 rounded"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Sujet"
          className="border p-2 rounded"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <textarea
          placeholder="Message"
          className="border p-2 rounded h-32"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Envoyer
        </button>
      </form>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}
