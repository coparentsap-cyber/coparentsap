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
    console.log('🔧 FONCTION EDGE APPELÉE - send-simple-email')
    
    const { to_email, from_user_name, invite_code, type = 'invitation' } = await req.json()
    
    console.log('📧 DONNÉES REÇUES:', { to_email, from_user_name, invite_code, type })

    // Configuration Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = 'Co-Parents <coparentsap@gmail.com>'
    
    console.log('🔑 API Key disponible:', !!resendApiKey)
    console.log('📤 From email:', fromEmail)

    if (!resendApiKey) {
      console.warn('⚠️ AUCUNE CLÉ API - MODE DÉMO')
      
      // En mode démo, simuler l'envoi
      return new Response(
        JSON.stringify({ 
          success: true, 
          id: 'demo_' + Date.now(),
          message: `Email ${type} simulé envoyé à ${to_email} (mode démo - aucune clé API)`,
          preview: {
            subject: type === 'welcome' ? '🎉 Bienvenue sur Co-Parents !' : `${from_user_name} vous invite sur Co-Parents 👨‍👩‍👧‍👦`,
            code: invite_code,
            recipient: to_email
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    console.log('🌐 ENVOI RÉEL AVEC RESEND...')
    
    let subject, htmlContent

    if (type === 'welcome') {
      subject = '🎉 Bienvenue sur Co-Parents !'
      htmlContent = generateWelcomeEmail(from_user_name, invite_code)
      console.log('📝 Email de bienvenue généré')
    } else {
      subject = `${from_user_name} vous invite sur Co-Parents 👨‍👩‍👧‍👦`
      htmlContent = generateInviteEmail(from_user_name, invite_code)
      console.log('📝 Email d\'invitation généré')
    }

    // Validation de l'email avant envoi
    if (!to_email || !to_email.includes('@')) {
      throw new Error('Adresse email invalide')
    }

    // Envoi avec Resend
    const emailPayload = {
      from: fromEmail,
      to: [to_email],
      subject: subject,
      html: htmlContent,
      headers: {
        'X-Entity-Ref-ID': `coparents_${type}_${Date.now()}`,
      }
    }
    
    console.log('📋 PAYLOAD RESEND:', { ...emailPayload, html: '[HTML_CONTENT]' })
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Co-Parents-App/1.0',
      },
      body: JSON.stringify(emailPayload),
    })

    const responseHeaders = Object.fromEntries(response.headers.entries())
    console.log('📊 RÉPONSE RESEND:', {
      status: response.status,
      statusText: response.statusText,
      rateLimitRemaining: responseHeaders['x-ratelimit-remaining'],
      rateLimitReset: responseHeaders['x-ratelimit-reset']
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ ERREUR RESEND DÉTAILLÉE:', error)
      
      // Gestion spécifique des erreurs Resend
      if (response.status === 429) {
        throw new Error('Rate limit atteint - Réessayez dans quelques minutes')
      } else if (response.status === 401) {
        throw new Error('Clé API Resend invalide ou expirée')
      } else if (response.status === 422) {
        throw new Error('Données email invalides - Vérifiez l\'adresse email')
      }
      
      throw new Error(`Erreur Resend HTTP ${response.status}: ${error}`)
    }

    const result = await response.json()
    console.log('✅ SUCCÈS RESEND:', result)

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: result.id,
        details: result,
        message: `Email ${type} envoyé avec succès à ${to_email}`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ ERREUR CRITIQUE FONCTION EDGE:', error)
    console.error('📊 Stack trace:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString(),
        function: 'send-simple-email'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

function generateWelcomeEmail(name: string, inviteCode: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Bienvenue sur Co-Parents</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto;">
            <!-- Header avec logo -->
            <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Co-Parents</h1>
                <p style="color: white; margin: 15px 0 0 0; opacity: 0.95; font-size: 18px;">L'app des familles recomposées</p>
            </div>
            
            <!-- Contenu principal -->
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #374151; margin-top: 0; font-size: 24px;">Bonjour ${name} ! 👋</h2>
                
                <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
                    Félicitations ! Votre compte Co-Parents a été créé avec succès. Vous pouvez maintenant organiser votre coparentalité en toute simplicité.
                </p>
                
                <!-- Code unique -->
                <div style="background: #f3f4f6; padding: 25px; border-radius: 12px; margin: 30px 0;">
                    <h3 style="color: #374151; margin-top: 0; font-size: 18px;">🔑 Votre code unique :</h3>
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; font-family: monospace; font-size: 28px; font-weight: bold; color: #8b5cf6; border: 3px solid #8b5cf6; margin: 15px 0;">
                        ${inviteCode}
                    </div>
                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 0; text-align: center;">
                        Partagez ce code avec votre co-parent pour vous connecter
                    </p>
                </div>
                
                <!-- Bouton d'action -->
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${Deno.env.get('APP_URL') || 'https://co-parents.app'}" style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 18px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Ouvrir Co-Parents
                    </a>
                </div>
                
                <!-- Footer -->
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    Besoin d'aide ? Contactez-nous à coparentsap@gmail.com<br>
                    Co-Parents - L'application qui simplifie la coparentalité
                </p>
            </div>
        </div>
    </body>
    </html>
  `
}

function generateInviteEmail(fromName: string, inviteCode: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Invitation Co-Parents</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Co-Parents</h1>
                <p style="color: white; margin: 15px 0 0 0; opacity: 0.95; font-size: 18px;">Invitation à rejoindre</p>
            </div>
            
            <!-- Contenu -->
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #374151; margin-top: 0; font-size: 24px;">🎉 ${fromName} vous invite !</h2>
                
                <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
                    <strong>${fromName}</strong> utilise Co-Parents pour organiser la garde partagée et souhaite vous connecter pour simplifier votre coparentalité.
                </p>
                
                <!-- Instructions -->
                <div style="background: #f3f4f6; padding: 25px; border-radius: 12px; margin: 30px 0;">
                    <h3 style="color: #374151; margin-top: 0; font-size: 18px;">📱 Comment rejoindre :</h3>
                    <ol style="color: #6b7280; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>Téléchargez l'application Co-Parents</li>
                        <li>Créez votre compte avec cet email</li>
                        <li>Entrez le code de connexion ci-dessous</li>
                        <li>Vous serez connectés automatiquement !</li>
                    </ol>
                </div>
                
                <!-- Code de connexion -->
                <div style="background: #eff6ff; padding: 25px; border-radius: 12px; border-left: 4px solid #3b82f6; margin: 30px 0;">
                    <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">🔑 Code de connexion :</h3>
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; font-family: monospace; font-size: 28px; font-weight: bold; color: #8b5cf6; border: 3px solid #8b5cf6; margin: 15px 0;">
                        ${inviteCode}
                    </div>
                    <p style="color: #3730a3; font-size: 14px; margin-bottom: 0; text-align: center;">
                        Entrez ce code dans l'app après votre inscription
                    </p>
                </div>
                
                <!-- Boutons téléchargement -->
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${Deno.env.get('APP_URL') || 'https://co-parents.app'}" style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 18px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block; margin-bottom: 15px;">
                        Ouvrir Co-Parents
                    </a>
                    <br>
                    <a href="https://play.google.com/store" style="background: #22c55e; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px; display: inline-block;">
                        📱 Android
                    </a>
                    <a href="https://apps.apple.com" style="background: #374151; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                        🍎 iPhone
                    </a>
                </div>
                
                <!-- Footer -->
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    Cet email a été envoyé par ${fromName} via Co-Parents<br>
                    Besoin d'aide ? coparentsap@gmail.com
                </p>
            </div>
        </div>
    </body>
    </html>
  `
}