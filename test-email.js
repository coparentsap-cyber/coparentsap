// test-email.js
import 'dotenv/config';
import { Resend } from 'resend';

// Mets ici ta clé API Resend (ou laisse vide si tu utilises .env)
const resend = new Resend(process.env.VITE_RESEND_API_KEY || 're_ta_clef_api_resend');

async function sendTestEmail() {
  try {
    const data = await resend.emails.send({
      from: 'Co-Parents <coparentsap@gmail.com>', // doit être un expéditeur validé dans Resend
      to: 'TON_EMAIL_PERSONNEL@gmail.com', // remplace par ton email
      subject: 'Test d’envoi depuis Co-Parents 🚀',
      html: `<h1>✅ Test réussi</h1><p>Si tu vois ce message, l’email fonctionne bien.</p>`,
    });

    console.log('✅ Email envoyé avec succès :', data);
  } catch (error) {
    console.error('❌ Erreur envoi email :', error);
  }
}

sendTestEmail();
