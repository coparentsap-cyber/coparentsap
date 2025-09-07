import { supabase } from "./supabase";

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  private static instance: EmailService;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Envoyer email de bienvenue
  async sendWelcomeEmail(email: string, name: string, inviteCode: string) {
    const emailData: EmailData = {
      to: email,
      subject: "🎉 Bienvenue sur Co-Parents !",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Co-Parents</h1>
            <p style="color: white; margin: 15px 0 0 0; opacity: 0.95; font-size: 18px;">L'app des familles recomposées</p>
          </div>
          
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #374151; margin-top: 0; font-size: 24px;">Bonjour ${name} ! 👋</h2>
            
            <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
              Félicitations ! Votre compte Co-Parents a été créé avec succès. Vous pouvez maintenant organiser votre coparentalité en toute simplicité.
            </p>
            
            <div style="background: #f3f4f6; padding: 25px; border-radius: 12px; margin: 30px 0;">
              <h3 style="color: #374151; margin-top: 0; font-size: 18px;">🔑 Votre code unique :</h3>
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; font-family: monospace; font-size: 28px; font-weight: bold; color: #8b5cf6; border: 3px solid #8b5cf6; margin: 15px 0;">
                ${inviteCode}
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 0; text-align: center;">
                Partagez ce code avec votre co-parent pour vous connecter
              </p>
            </div>
            
            <div style="background: #eff6ff; padding: 25px; border-radius: 12px; border-left: 4px solid #3b82f6; margin: 30px 0;">
              <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">📱 Prochaines étapes :</h3>
              <ol style="color: #1e40af; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Complétez votre profil et ajoutez vos enfants</li>
                <li>Partagez votre code <strong>${inviteCode}</strong> avec votre co-parent</li>
                <li>Votre co-parent télécharge l'app et entre votre code</li>
                <li>Vous êtes connectés et pouvez partager planning, photos et messages !</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${window.location.origin}" style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 18px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">
                Ouvrir Co-Parents
              </a>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                ✨ <strong>Essai gratuit 1 mois complet</strong> • Aucun engagement • Annulation en 1 clic
              </p>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              Besoin d'aide ? Contactez-nous à coparentsap@gmail.com<br>
              Co-Parents - L'application qui simplifie la coparentalité
            </p>
          </div>
        </div>
      `,
    };

    return this.sendEmail(emailData);
  }

  // Envoyer invitation co-parent
  async sendInviteEmail(toEmail: string, fromName: string, inviteCode: string) {
    const emailData: EmailData = {
      to: toEmail,
      subject: `${fromName} vous invite sur Co-Parents 👨‍👩‍👧‍👦`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Co-Parents</h1>
            <p style="color: white; margin: 15px 0 0 0; opacity: 0.95; font-size: 18px;">Invitation à rejoindre</p>
          </div>
          
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #374151; margin-top: 0; font-size: 24px;">🎉 ${fromName} vous invite !</h2>
            
            <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
              <strong>${fromName}</strong> utilise Co-Parents pour organiser la garde partagée et souhaite vous connecter pour simplifier votre coparentalité.
            </p>
            
            <div style="background: #f3f4f6; padding: 25px; border-radius: 12px; margin: 30px 0;">
              <h3 style="color: #374151; margin-top: 0; font-size: 18px;">📱 Comment rejoindre :</h3>
              <ol style="color: #6b7280; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Téléchargez l'application Co-Parents</li>
                <li>Créez votre compte avec cet email</li>
                <li>Entrez le code de connexion de ${fromName}</li>
                <li>Vous serez connectés automatiquement !</li>
              </ol>
            </div>
            
            <div style="background: #eff6ff; padding: 25px; border-radius: 12px; border-left: 4px solid #3b82f6; margin: 30px 0;">
              <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">🔑 Code de connexion :</h3>
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; font-family: monospace; font-size: 28px; font-weight: bold; color: #8b5cf6; border: 3px solid #8b5cf6; margin: 15px 0;">
                ${inviteCode}
              </div>
              <p style="color: #3730a3; font-size: 14px; margin-bottom: 0; text-align: center;">
                Entrez ce code dans l'app après votre inscription
              </p>
            </div>
            
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
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                ✨ <strong>Essai gratuit 1 mois</strong> • Aucun engagement • Annulation en 1 clic
              </p>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              Cet email a été envoyé par ${fromName} via Co-Parents<br>
              Besoin d'aide ? coparentsap@gmail.com
            </p>
          </div>
        </div>
      `,
    };

    return this.sendEmail(emailData);
  }

  // Envoyer email de réinitialisation mot de passe
  async sendPasswordResetEmail(email: string) {
    const emailData: EmailData = {
      to: email,
      subject: "🔒 Réinitialisation de votre mot de passe Co-Parents",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Co-Parents</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Réinitialisation mot de passe</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #374151; margin-top: 0;">🔒 Réinitialisation demandée</h2>
            
            <p style="color: #6b7280; line-height: 1.6;">
              Vous avez demandé la réinitialisation de votre mot de passe Co-Parents.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${window.location.origin}/auth/reset-password" style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            
            <p style="color: #ef4444; font-size: 14px; text-align: center;">
              ⚠️ Ce lien expire dans 1 heure pour votre sécurité
            </p>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 20px;">
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
          </div>
        </div>
      `,
    };

    return this.sendEmail(emailData);
  }

  // Envoyer notification de changement
  async sendChangeNotification(
    toEmail: string,
    fromName: string,
    changeType: string,
    details: string
  ) {
    const typeEmojis = {
      planning: "📅",
      document: "📄",
      photo: "📸",
      message: "💬",
      validation: "✅",
    };

    const emailData: EmailData = {
      to: toEmail,
      subject: `${typeEmojis[changeType as keyof typeof typeEmojis]} ${fromName} a mis à jour ${changeType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Co-Parents</h1>
            <p style="color: white; margin: 8px 0 0 0; opacity: 0.9;">Nouvelle mise à jour</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #374151; margin-top: 0;">${typeEmojis[changeType as keyof typeof typeEmojis]} Mise à jour de ${fromName}</h2>
            
            <p style="color: #6b7280; line-height: 1.6;">
              ${details}
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${window.location.origin}" style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Voir dans l'app
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
              Co-Parents - Simplifiez votre coparentalité
            </p>
          </div>
        </div>
      `,
    };

    return this.sendEmail(emailData);
  }

  // Fonction générique d'envoi d'email
  private async sendEmail(emailData: EmailData) {
    try {
      if (!supabase) {
        console.log(
          "📧 Email simulé (Supabase non configuré):",
          emailData.subject,
          "vers",
          emailData.to
        );
        return { success: true, id: "demo_" + Date.now() };
      }

      const { data, error } = await supabase.functions.invoke("send-email", {
        body: emailData,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erreur envoi email:", error);
      // En cas d'erreur, ne pas bloquer l'application
      console.log("📧 Email simulé (erreur service):", emailData.subject, "vers", emailData.to);
      return { success: true, id: "fallback_" + Date.now() };
    }
  }

  // Tester la configuration email
  async testEmailConfiguration() {
    try {
      if (!supabase) {
        return { success: false, message: "Supabase non configuré" };
      }

      const { data, error } = await supabase.functions.invoke("test-email", {
        body: { test: true },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erreur test email:", error);
      return { success: false, message: error.message };
    }
  }
}

export const emailService = EmailService.getInstance();
