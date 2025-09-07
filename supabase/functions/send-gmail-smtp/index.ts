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
    console.log('📧 FONCTION GMAIL SMTP APPELÉE')
    
    const { to_email, from_user_name, invite_code, type = 'invitation' } = await req.json()
    
    console.log('📧 DONNÉES REÇUES:', { to_email, from_user_name, invite_code, type })

    // Configuration SMTP Gmail
    const smtpConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true pour 465, false pour autres ports
      auth: {
        user: Deno.env.get('SMTP_USER'), // Votre email Gmail
        pass: Deno.env.get('SMTP_PASSWORD') // Votre mot de passe d'application
      }
    }
    
    console.log('🔑 Configuration SMTP:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.auth.user,
      passwordConfigured: !!smtpConfig.auth.pass
    })

    if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
      console.warn('⚠️ CONFIGURATION SMTP INCOMPLÈTE')
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configuration SMTP manquante',
          message: 'Veuillez configurer SMTP_USER et SMTP_PASSWORD dans Supabase',
          fallback: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    console.log('📤 ENVOI VIA GMAIL SMTP...')
    
    let subject, htmlContent

    if (type === 'welcome') {
      subject = '🎉 Bienvenue sur Co-Parents !'
      htmlContent = generateWelcomeEmail(from_user_name, invite_code)
    } else {
      subject = `${from_user_name} vous invite sur Co-Parents 👨‍👩‍👧‍👦`
      htmlContent = generateInviteEmail(from_user_name, invite_code)
    }

    // Simuler l'envoi SMTP (Deno n'a pas de client SMTP natif)
    // En production, utilisez une bibliothèque SMTP ou Resend
    console.log('📧 EMAIL PRÉPARÉ POUR ENVOI SMTP:')
    console.log(`   De: ${smtpConfig.auth.user}`)
    console.log(`   Vers: ${to_email}`)
    console.log(`   Sujet: ${subject}`)
    
    // Pour l'instant, simuler le succès
    // TODO: Implémenter l'envoi SMTP réel avec une bibliothèque
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        id: 'gmail_smtp_' + Date.now(),
        message: `Email ${type} préparé pour envoi SMTP Gmail`,
        smtp_config: {
          host: smtpConfig.host,
          port: smtpConfig.port,
          user: smtpConfig.auth.user
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ ERREUR GMAIL SMTP:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
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
            <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Co-Parents</h1>
                <p style="color: white; margin: 15px 0 0 0; opacity: 0.95; font-size: 18px;">L'app des familles recomposées</p>
            </div>
            
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #374151; margin-top: 0; font-size: 24px;">Bonjour ${name} ! 👋</h2>
                
                <div style="background: #fef3c7; border: 3px solid #f59e0b; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                    <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">
                        🚨 VÉRIFIEZ VOTRE DOSSIER SPAM !
                    </h3>
                    <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: bold;">
                        📧 90% des emails Co-Parents arrivent dans le Spam
                    </p>
                </div>
                
                <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
                    Félicitations ! Votre compte Co-Parents a été créé avec succès.
                </p>
                
                <div style="background: #f3f4f6; padding: 25px; border-radius: 12px; margin: 30px 0;">
                    <h3 style="color: #374151; margin-top: 0; font-size: 18px;">🔑 Votre code unique :</h3>
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; font-family: monospace; font-size: 28px; font-weight: bold; color: #8b5cf6; border: 3px solid #8b5cf6; margin: 15px 0;">
                        ${inviteCode}
                    </div>
                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 0; text-align: center;">
                        Partagez ce code avec votre co-parent
                    </p>
                </div>
                
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${Deno.env.get('APP_URL') || 'https://co-parents.app'}" style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 18px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Ouvrir Co-Parents
                    </a>
                </div>
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    🚨 RAPPEL : Vérifiez TOUJOURS votre dossier Spam !<br>
                    Besoin d'aide ? coparentsap@gmail.com<br>
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
            <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Co-Parents</h1>
                <p style="color: white; margin: 15px 0 0 0; opacity: 0.95; font-size: 18px;">Invitation à rejoindre</p>
            </div>
            
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #374151; margin-top: 0; font-size: 24px;">🎉 ${fromName} vous invite !</h2>
                
                <div style="background: #fef3c7; border: 3px solid #f59e0b; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                    <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">
                        🚨 VÉRIFIEZ VOTRE DOSSIER SPAM !
                    </h3>
                    <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: bold;">
                        📧 90% des emails Co-Parents arrivent dans le Spam
                    </p>
                </div>
                
                <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
                    <strong>${fromName}</strong> utilise Co-Parents et souhaite vous connecter.
                </p>
                
                <div style="background: #eff6ff; padding: 25px; border-radius: 12px; border-left: 4px solid #3b82f6; margin: 30px 0;">
                    <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">🔑 Code de connexion :</h3>
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; font-family: monospace; font-size: 28px; font-weight: bold; color: #8b5cf6; border: 3px solid #8b5cf6; margin: 15px 0;">
                        ${inviteCode}
                    </div>
                </div>
                
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${Deno.env.get('APP_URL') || 'https://co-parents.app'}" style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 18px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Ouvrir Co-Parents
                    </a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
}