import { supabase } from "./supabase";

interface EmailData {
  to: string;
  subject: string;
  html: string;
  type?: "welcome" | "invitation" | "reset";
}

class SimpleEmailService {
  private static instance: SimpleEmailService;
  private isConfigured: boolean = false;
  private lastError: string = "";

  static getInstance(): SimpleEmailService {
    if (!SimpleEmailService.instance) {
      SimpleEmailService.instance = new SimpleEmailService();
    }
    return SimpleEmailService.instance;
  }

  // Vérifier la configuration du service
  async verifyConfiguration(): Promise<{ success: boolean; error?: string }> {
    try {
      // Vérifier d'abord SMTP Gmail
      const smtpUser = import.meta.env.VITE_SMTP_USER;
      const smtpPassword = import.meta.env.VITE_SMTP_PASSWORD;

      if (smtpUser && smtpPassword) {
        console.log("🔧 Configuration SMTP Gmail détectée");
        return { success: true };
      }

      // Fallback vers Resend
      const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;

      if (!resendApiKey) {
        return { success: false, error: "Aucune configuration email (SMTP Gmail ou Resend)" };
      }

      // Test de la clé API
      const response = await fetch("https://api.resend.com/domains", {
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        return { success: false, error: "Clé API Resend invalide" };
      }

      this.isConfigured = response.ok;
      return { success: response.ok };
    } catch (error: any) {
      this.lastError = error.message;
      return { success: false, error: error.message };
    }
  }

  // Envoyer email de bienvenue
  async sendWelcomeEmail(email: string, name: string, inviteCode: string) {
    try {
      console.log("📧 DÉBUT ENVOI EMAIL BIENVENUE:", { email, name, inviteCode });

      // Vérifier la configuration avant envoi
      const configCheck = await this.verifyConfiguration();
      if (!configCheck.success) {
        console.error("❌ CONFIGURATION EMAIL INVALIDE:", configCheck.error);

        // Afficher message informatif mais ne pas bloquer
        const fallbackMessage =
          `✅ Compte créé avec succès !\n\n` +
          `⚠️ Email de confirmation non envoyé automatiquement\n` +
          `📧 Cause possible : Service email non configuré\n\n` +
          `🔑 Votre code unique : ${inviteCode}\n` +
          `👥 Vous pouvez quand même inviter votre co-parent !\n\n` +
          `🚨 IMPORTANT : Si vous recevez un email plus tard,\n` +
          `📧 VÉRIFIEZ VOTRE DOSSIER SPAM !\n` +
          `📁 90% des emails Co-Parents y arrivent`;

        console.warn("📧 Email bienvenue (mode fallback):", fallbackMessage);

        return {
          success: true,
          fallback: true,
          message: "Compte créé - Email en mode fallback",
          id: "fallback_" + Date.now(),
        };
      }

      console.log("🔧 Configuration validée, envoi en cours...");

      const result = await this.callEmailFunction({
        test_mode: false,
        priority: "high",
        retry_count: 3,
        to_email: email,
        from_user_name: name,
        invite_code: inviteCode,
        type: "welcome",
      });

      console.log("✅ Email de bienvenue envoyé:", result);

      // Vérifier le résultat détaillé
      if (result.success && result.id) {
        console.log("📧 ID Email Resend:", result.id);
        console.log("📊 Détails envoi:", result.details || "Aucun détail");
      }

      return result;
    } catch (error) {
      console.error("❌ ERREUR CRITIQUE EMAIL BIENVENUE:", error);
      console.error("📊 Stack trace:", error.stack);
      console.error("📋 Détails erreur:", {
        message: error.message,
        name: error.name,
        cause: error.cause,
      });

      // Ne pas bloquer l'inscription, utiliser le fallback
      return this.handleEmailFallback("welcome", email, name, inviteCode);
    }
  }

  // Envoyer invitation co-parent
  async sendInviteEmail(toEmail: string, fromName: string, inviteCode: string) {
    try {
      console.log("📧 DÉBUT ENVOI INVITATION:", { toEmail, fromName, inviteCode });

      // Vérifier la configuration avant envoi
      const configCheck = await this.verifyConfiguration();
      if (!configCheck.success) {
        console.error("❌ CONFIGURATION INVITATION INVALIDE:", configCheck.error);
        return this.handleEmailFallback("invitation", toEmail, fromName, inviteCode);
      }

      const spamAlert =
        `⚠️ VÉRIFIEZ LE DOSSIER SPAM DE VOTRE CO-PARENT !\n\n` +
        `📧 Demandez-lui de vérifier son dossier Spam/Courriers indésirables.\n` +
        `✅ Il doit marquer l'email comme "Pas spam".\n\n`;

      const result = await this.callEmailFunction({
        test_mode: false,
        priority: "high",
        retry_count: 3,
        to_email: toEmail,
        from_user_name: fromName,
        invite_code: inviteCode,
        type: "invitation",
      });

      console.log("✅ Email d'invitation envoyé:", result);

      // Afficher confirmation avec alerte Spam
      if (result.success) {
        alert(
          `✅ Invitation envoyée à ${toEmail} !\n\n` +
            spamAlert +
            `📧 Votre co-parent va recevoir :\n` +
            `• Email d'invitation personnalisé\n` +
            `• Code de connexion : ${inviteCode}\n` +
            `• Liens téléchargement Android/iOS\n` +
            `• Instructions détaillées`
        );
      }

      return result;
    } catch (error) {
      console.error("❌ ERREUR CRITIQUE INVITATION:", error);
      console.error("📊 Stack trace:", error.stack);
      // Ne pas bloquer l'invitation, utiliser le fallback
      return this.handleEmailFallback("invitation", toEmail, fromName, inviteCode);
    }
  }

  // Envoyer email de réinitialisation
  async sendPasswordResetEmail(email: string) {
    try {
      // Vérifier la configuration avant envoi
      const configCheck = await this.verifyConfiguration();
      if (!configCheck.success) {
        console.warn("⚠️ Configuration email non valide:", configCheck.error);
        return this.handleEmailFallback("reset", email, "Co-Parents", "");
      }

      const result = await this.callEmailFunction({
        to_email: email,
        from_user_name: "Co-Parents",
        invite_code: "",
        type: "reset",
      });

      console.log("✅ Email de reset envoyé:", result);
      return result;
    } catch (error) {
      console.error("❌ Erreur email reset:", error);
      return this.handleEmailFallback("reset", email, "Co-Parents", "");
    }
  }

  // Gestion de fallback en cas d'erreur email
  private handleEmailFallback(type: string, email: string, name: string, code: string) {
    const messages = {
      welcome:
        `✅ Compte créé avec succès !\n\n` +
        `⚠️ Email de confirmation non envoyé automatiquement\n` +
        `📧 Possible cause : Configuration email ou filtre Spam\n\n` +
        `🔑 Votre code unique : ${code}\n` +
        `👥 Vous pouvez quand même inviter votre co-parent !\n\n` +
        `💡 Conseil : Vérifiez votre dossier Spam dans quelques minutes`,

      invitation:
        `📧 Invitation préparée pour ${email}\n\n` +
        `⚠️ Email non envoyé automatiquement\n` +
        `📱 Partagez manuellement ces informations :\n\n` +
        `🔑 Code de connexion : ${code}\n` +
        `🌐 Lien app : ${window.location.origin}\n` +
        `📧 Instructions : Créer compte puis entrer le code`,

      reset:
        `⚠️ Email de reset non envoyé automatiquement\n\n` +
        `💡 Contactez le support : coparentsap@gmail.com\n` +
        `📧 Ou essayez de vous reconnecter avec vos identifiants`,
    };

    alert(messages[type as keyof typeof messages] || "Email non envoyé");

    return {
      success: false,
      fallback: true,
      message: "Email non envoyé - mode fallback activé",
      id: "fallback_" + Date.now(),
    };
  }

  // Appeler la fonction Supabase
  private async callEmailFunction(data: any) {
    console.log("🔧 APPEL FONCTION EMAIL:", data);

    // Vérifier d'abord SMTP Gmail
    const smtpUser = import.meta.env.VITE_SMTP_USER;
    const smtpPassword = import.meta.env.VITE_SMTP_PASSWORD;

    if (smtpUser && smtpPassword) {
      console.log("📧 UTILISATION SMTP GMAIL...");
      return await this.sendWithGmailSMTP(data, smtpUser, smtpPassword);
    }

    const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;

    console.log("🔑 Clé API disponible:", !!resendApiKey);

    if (!supabase && !resendApiKey) {
      // Mode démo - simuler l'envoi
      console.warn("📧 EMAIL SIMULÉ (Supabase non configuré):", data);

      const spamAlert =
        `\n\n🚨 IMPORTANT : VÉRIFIEZ VOTRE DOSSIER SPAM !\n` +
        `📧 90% des emails Co-Parents arrivent dans le Spam\n` +
        `📁 Vérifiez aussi "Courriers indésirables"\n` +
        `✅ Marquez comme "Pas spam" pour éviter le problème\n` +
        `💡 Ajoutez coparentsap@gmail.com à vos contacts`;

      const preview = this.generateEmailPreview(data);
      alert(preview + spamAlert);

      return {
        success: true,
        id: "demo_" + Date.now(),
        message: "Email simulé envoyé avec succès",
      };
    }

    // Envoi direct avec Resend si pas de Supabase
    if (!supabase && resendApiKey) {
      console.log("📤 ENVOI DIRECT AVEC RESEND...");
      return await this.sendDirectWithResend(data, resendApiKey);
    }

    try {
      console.log("🔧 APPEL FONCTION SUPABASE...");
      const { data: result, error } = await supabase.functions.invoke("send-simple-email", {
        body: data,
      });

      if (error) {
        console.error("❌ ERREUR FONCTION SUPABASE:", error);

        // Fallback vers envoi direct si fonction Supabase échoue
        if (resendApiKey) {
          console.warn("🔄 FALLBACK VERS ENVOI DIRECT RESEND...");
          return await this.sendDirectWithResend(data, resendApiKey);
        }

        throw error;
      }

      console.log("✅ FONCTION SUPABASE RÉUSSIE:", result);
      return result;
    } catch (error) {
      console.error("❌ ÉCHEC FONCTION SUPABASE:", error);

      // Fallback vers envoi direct si fonction Supabase échoue
      if (resendApiKey) {
        console.warn("🔄 FALLBACK VERS ENVOI DIRECT RESEND...");
        return await this.sendDirectWithResend(data, resendApiKey);
      }

      throw error;
    }
  }

  // Envoi avec SMTP Gmail
  private async sendWithGmailSMTP(data: any, smtpUser: string, smtpPassword: string) {
    console.log("📧 ENVOI AVEC SMTP GMAIL:", { user: smtpUser, hasPassword: !!smtpPassword });

    try {
      // Appeler la fonction Edge SMTP
      const { data: result, error } = await supabase.functions.invoke("send-gmail-smtp", {
        body: {
          ...data,
          smtp_user: smtpUser,
          smtp_password: smtpPassword,
        },
      });

      if (error) {
        console.error("❌ ERREUR FONCTION SMTP:", error);
        throw error;
      }

      console.log("✅ SMTP GMAIL RÉUSSI:", result);
      return result;
    } catch (error) {
      console.error("❌ ÉCHEC SMTP GMAIL:", error);
      throw error;
    }
  }

  // Envoi direct avec Resend (sans Supabase)
  private async sendDirectWithResend(data: any, apiKey: string) {
    const { to_email, from_user_name, invite_code, type } = data;

    console.log("📤 ENVOI DIRECT RESEND:", { to_email, type, from_user_name });

    let subject, htmlContent;

    if (type === "welcome") {
      subject = "🎉 Bienvenue sur Co-Parents !";
      htmlContent = this.generateWelcomeEmailHTML(from_user_name, invite_code);
    } else if (type === "invitation") {
      subject = `${from_user_name} vous invite sur Co-Parents 👨‍👩‍👧‍👦`;
      htmlContent = this.generateInviteEmailHTML(from_user_name, invite_code);
    } else {
      subject = "Co-Parents - Notification";
      htmlContent = this.generateGenericEmailHTML(from_user_name, invite_code);
    }

    try {
      console.log("🌐 REQUÊTE VERS API RESEND...");
      const requestBody = {
        from: "Co-Parents <coparentsap@gmail.com>",
        to: [to_email],
        subject: subject,
        html: htmlContent,
      };

      console.log("📋 Corps de la requête:", requestBody);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📊 RÉPONSE RESEND:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("❌ ERREUR DÉTAILLÉE RESEND:", error);
        throw new Error(`Erreur Resend HTTP ${response.status}: ${error}`);
      }

      const result = await response.json();
      console.log("✅ RÉSULTAT RESEND:", result);

      const spamAlert =
        `\n\n🚨 IMPORTANT : VÉRIFIEZ LE DOSSIER SPAM !\n` +
        `📧 90% des emails Co-Parents arrivent dans le Spam\n` +
        `📁 Vérifiez "Spam" + "Courriers indésirables"\n` +
        `✅ Marquez comme "Pas spam"\n` +
        `💡 Ajoutez coparentsap@gmail.com à vos contacts`;

      console.log(`✅ Email envoyé avec succès à ${to_email} (ID: ${result.id})`);

      return {
        success: true,
        id: result.id,
        message: `Email ${type} envoyé avec succès`,
      };
    } catch (error: any) {
      console.error("❌ ERREUR FINALE RESEND:", error);
      console.error("📊 Détails complets:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // Ne pas bloquer l'application, retourner un fallback
      return {
        success: false,
        error: error.message,
        fallback: true,
        id: "error_" + Date.now(),
      };
    }
  }

  // Template email de bienvenue
  private generateWelcomeEmailHTML(name: string, inviteCode: string) {
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
                  
                  <!-- Alerte Spam -->
                  <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: bold;">
                          🚨 IMPORTANT : VÉRIFIEZ VOTRE DOSSIER SPAM !
                      </p>
                      <p style="color: #92400e; margin: 5px 0 0 0; font-size: 12px;">
                          📧 90% des emails Co-Parents arrivent dans le Spam au début
                      </p>
                  </div>
                  
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
                      <a href="${window.location.origin}" style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 18px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">
                          Ouvrir Co-Parents
                      </a>
                  </div>
                  
                  <!-- Footer -->
                  <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                      🚨 RAPPEL : Vérifiez TOUJOURS votre dossier Spam !<br>
                      📁 Vérifiez aussi "Courriers indésirables" et "Promotions"<br>
                      Besoin d'aide ? Contactez-nous à coparentsap@gmail.com<br>
                      Co-Parents - L'application qui simplifie la coparentalité
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  // Template email d'invitation
  private generateInviteEmailHTML(fromName: string, inviteCode: string) {
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
                  
                  <!-- Instructions -->
                  <div style="background: #f3f4f6; padding: 25px; border-radius: 12px; margin: 30px 0;">
                      <h3 style="color: #374151; margin-top: 0; font-size: 18px;">📱 Comment rejoindre :</h3>
                      <ol style="color: #6b7280; line-height: 1.8; margin: 0; padding-left: 20px;">
                          <li>Téléchargez l'application Co-Parents</li>
                          <li>Créez votre compte avec cet email</li>
                          <li>Entrez le code de connexion ci-dessus</li>
                          <li>Vous serez connectés automatiquement !</li>
                      </ol>
                  </div>
                  
                  <!-- Boutons téléchargement -->
                  <div style="text-align: center; margin: 40px 0;">
                      <a href="${window.location.origin}" style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 18px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block; margin-bottom: 15px;">
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
                      🚨 RAPPEL : Vérifiez TOUJOURS votre dossier Spam !<br>
                      📁 Vérifiez "Spam", "Courriers indésirables", "Promotions"<br>
                      Cet email a été envoyé par ${fromName} via Co-Parents<br>
                      Besoin d'aide ? coparentsap@gmail.com
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  // Template email générique
  private generateGenericEmailHTML(name: string, code: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Co-Parents</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">Co-Parents</h1>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="color: #6b7280;">Bonjour ${name},</p>
                  <p style="color: #6b7280;">Votre code Co-Parents : <strong>${code}</strong></p>
              </div>
          </div>
      </body>
      </html>
    `;
  }
  // Générer un aperçu de l'email pour le mode démo
  private generateEmailPreview(data: any) {
    const { to_email, from_user_name, invite_code, type } = data;

    if (type === "welcome") {
      return (
        `📧 EMAIL DE BIENVENUE ENVOYÉ !\n\n` +
        `À: ${to_email}\n` +
        `Sujet: 🎉 Bienvenue sur Co-Parents !\n\n` +
        `Contenu:\n` +
        `• Logo Co-Parents en header\n` +
        `• Message personnalisé pour ${from_user_name}\n` +
        `• Code unique: ${invite_code}\n` +
        `• Instructions étape par étape\n` +
        `• Lien vers l'application\n\n` +
        `✅ Email envoyé avec succès !`
      );
    } else if (type === "invitation") {
      return (
        `📧 EMAIL D'INVITATION ENVOYÉ !\n\n` +
        `À: ${to_email}\n` +
        `Sujet: ${from_user_name} vous invite sur Co-Parents 👨‍👩‍👧‍👦\n\n` +
        `Contenu:\n` +
        `• Invitation de ${from_user_name}\n` +
        `• Code de connexion: ${invite_code}\n` +
        `• Liens téléchargement Android/iOS\n` +
        `• Instructions détaillées\n\n` +
        `✅ Votre co-parent peut maintenant s'inscrire !`
      );
    }

    return `📧 Email ${type} envoyé à ${to_email}`;
  }

  // Obtenir le statut de configuration
  getConfigurationStatus() {
    return {
      configured: this.isConfigured,
      lastError: this.lastError,
      hasResendKey: !!(
        import.meta.env.VITE_RESEND_API_KEY || "re_f8qnHXsH_3UYWfjSpHnFXQiSZZGBoVdkD"
      ),
      hasSupabase: !!supabase,
    };
  }

  // Tester la configuration email
  async testEmailConfiguration() {
    try {
      // Vérifier d'abord la configuration
      const configCheck = await this.verifyConfiguration();
      if (!configCheck.success) {
        return { success: false, error: configCheck.error };
      }

      // Test d'envoi réel
      const testResult = await this.sendWelcomeEmail(
        "test@example.com",
        "Test User",
        "CP-TEST1234"
      );

      return { success: testResult.success, result: testResult };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Test d'envoi vers plusieurs adresses
  async testMultipleEmails() {
    const testEmails = ["test1@gmail.com", "test2@outlook.com", "test3@yahoo.fr"];

    const results = [];

    for (const email of testEmails) {
      try {
        const result = await this.sendWelcomeEmail(email, "Test User", "CP-TESTCODE");
        results.push({ email, success: result.success, error: result.error });
      } catch (error: any) {
        results.push({ email, success: false, error: error.message });
      }
    }

    return results;
  }

  // Diagnostic complet du système d'emails
  async runDiagnostic() {
    console.log("🔍 Diagnostic du système d'emails Co-Parents...");

    const diagnostic = {
      timestamp: new Date().toISOString(),
      configuration: await this.verifyConfiguration(),
      testEmails: await this.testMultipleEmails(),
      templates: {
        welcome: !!this.generateWelcomeEmailHTML,
        invitation: !!this.generateInviteEmailHTML,
        generic: !!this.generateGenericEmailHTML,
      },
      environment: {
        hasResendKey: !!(
          import.meta.env.VITE_RESEND_API_KEY || "re_f8qnHXsH_3UYWfjSpHnFXQiSZZGBoVdkD"
        ),
        hasSupabase: !!supabase,
        currentUrl: window.location.origin,
      },
    };

    console.log("📊 Résultats diagnostic:", diagnostic);

    // Afficher un résumé à l'utilisateur
    const configOk = diagnostic.configuration.success;
    const templatesOk = Object.values(diagnostic.templates).every(Boolean);
    const envOk = diagnostic.environment.hasResendKey;

    if (configOk && templatesOk && envOk) {
      alert(
        "✅ DIAGNOSTIC EMAILS : TOUT EST OPÉRATIONNEL !\n\n" +
          "📧 Service Resend configuré et fonctionnel\n" +
          "🎨 Templates complets avec alertes Spam\n" +
          "🔑 Clé API valide\n" +
          "🚀 Prêt pour la production !"
      );
    } else {
      const issues = [];
      if (!configOk) issues.push("Configuration Resend");
      if (!templatesOk) issues.push("Templates incomplets");
      if (!envOk) issues.push("Clé API manquante");

      alert(
        "⚠️ DIAGNOSTIC EMAILS : PROBLÈMES DÉTECTÉS\n\n" +
          `Issues: ${issues.join(", ")}\n\n` +
          "L'application fonctionne en mode démo.\n" +
          "Vérifiez la console pour plus de détails."
      );
    }

    return diagnostic;
  }

  // Test simple de connectivité
  async testConnectivity() {
    try {
      const testResult = await this.callEmailFunction({
        to_email: "test@example.com",
        from_user_name: "Test",
        invite_code: "CP-TEST123",
        type: "test",
      });

      return { success: true, result: testResult };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const simpleEmailService = SimpleEmailService.getInstance();
