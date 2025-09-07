import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, from } = await req.json()

    // Configuration email avec Resend (service recommandé)
    const emailApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = from || Deno.env.get('FROM_EMAIL') || 'Co-Parents <noreply@coparentsap.gmail.com>'

    if (!emailApiKey) {
      console.log('Mode démo - Email simulé:', { to, subject })
      
      // En mode démo, simuler l'envoi
      return new Response(
        JSON.stringify({ 
          success: true, 
          id: 'demo_' + Date.now(),
          message: 'Email simulé envoyé avec succès'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Envoi réel avec Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Erreur envoi email: ${error}`)
    }

    const result = await response.json()

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})