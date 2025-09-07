// Service de retry et gestion robuste des emails

interface EmailRetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  timeoutMs: number;
}

interface EmailQueueItem {
  id: string;
  type: "welcome" | "invitation" | "reset";
  to_email: string;
  from_user_name: string;
  invite_code: string;
  attempts: number;
  created_at: string;
  last_attempt: string;
  status: "pending" | "sent" | "failed" | "expired";
  error_log: string[];
}

class EmailRetryService {
  private static instance: EmailRetryService;
  private config: EmailRetryConfig = {
    maxRetries: 5,
    retryDelay: 2000, // 2 secondes
    backoffMultiplier: 2,
    timeoutMs: 30000, // 30 secondes
  };
  private queue: EmailQueueItem[] = [];

  static getInstance(): EmailRetryService {
    if (!EmailRetryService.instance) {
      EmailRetryService.instance = new EmailRetryService();
    }
    return EmailRetryService.instance;
  }

  // Envoyer email avec retry automatique
  async sendEmailWithRetry(
    type: "welcome" | "invitation" | "reset",
    toEmail: string,
    fromUserName: string,
    inviteCode: string
  ): Promise<{ success: boolean; id?: string; error?: string; attempts: number }> {
    console.log(`🔄 ENVOI EMAIL AVEC RETRY: ${type} vers ${toEmail}`);

    const queueItem: EmailQueueItem = {
      id: Date.now().toString(),
      type,
      to_email: toEmail,
      from_user_name: fromUserName,
      invite_code: inviteCode,
      attempts: 0,
      created_at: new Date().toISOString(),
      last_attempt: new Date().toISOString(),
      status: "pending",
      error_log: [],
    };

    this.queue.push(queueItem);

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      console.log(`📧 Tentative ${attempt}/${this.config.maxRetries} pour ${toEmail}`);

      queueItem.attempts = attempt;
      queueItem.last_attempt = new Date().toISOString();

      try {
        const result = await this.attemptEmailSend(queueItem);

        if (result.success) {
          console.log(`✅ SUCCÈS après ${attempt} tentative(s)`);
          queueItem.status = "sent";
          return { success: true, id: result.id, attempts: attempt };
        } else {
          queueItem.error_log.push(`Tentative ${attempt}: ${result.error}`);
          console.log(`❌ Échec tentative ${attempt}: ${result.error}`);
        }
      } catch (error: any) {
        const errorMsg = `Tentative ${attempt} - Exception: ${error.message}`;
        queueItem.error_log.push(errorMsg);
        console.error(`❌ Exception tentative ${attempt}:`, error);
      }

      // Attendre avant retry (sauf dernière tentative)
      if (attempt < this.config.maxRetries) {
        const delay = this.config.retryDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
        console.log(`⏳ Attente ${delay}ms avant retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Toutes les tentatives ont échoué
    console.error(`❌ ÉCHEC DÉFINITIF après ${this.config.maxRetries} tentatives`);
    queueItem.status = "failed";

    return {
      success: false,
      error: `Échec après ${this.config.maxRetries} tentatives: ${queueItem.error_log.join("; ")}`,
      attempts: this.config.maxRetries,
    };
  }

  // Tentative d'envoi unique avec timeout
  private async attemptEmailSend(
    queueItem: EmailQueueItem
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    return new Promise(async (resolve, reject) => {
      // Timeout
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout après ${this.config.timeoutMs}ms`));
      }, this.config.timeoutMs);

      try {
        const apiKey =
          import.meta.env.VITE_RESEND_API_KEY || "re_f8qnHXsH_3UYWfjSpHnFXQiSZZGBoVdkD";

        if (!apiKey) {
          throw new Error("Clé API Resend manquante");
        }

        const emailData = this.buildEmailData(queueItem);

        console.log(`📤 Envoi vers ${queueItem.to_email}...`);

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "User-Agent": "Co-Parents-App/1.0",
          },
          body: JSON.stringify(emailData),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Erreur HTTP ${response.status}:`, errorText);

          // Analyser le type d'erreur
          if (response.status === 429) {
            resolve({ success: false, error: "Rate limit exceeded - Retry plus tard" });
          } else if (response.status === 401) {
            resolve({ success: false, error: "Clé API invalide" });
          } else if (response.status >= 500) {
            resolve({ success: false, error: "Erreur serveur Resend - Retry possible" });
          } else {
            resolve({ success: false, error: `Erreur client ${response.status}: ${errorText}` });
          }
          return;
        }

        const result = await response.json();
        console.log(`✅ Email envoyé avec ID: ${result.id}`);

        resolve({ success: true, id: result.id });
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error(`❌ Exception lors de l'envoi:`, error);
        resolve({ success: false, error: error.message });
      }
    });
  }

  // Construire les données d'email
  private buildEmailData(queueItem: EmailQueueItem) {
    const baseData = {
      from: "Co-Parents <coparentsap@gmail.com>",
      to: [queueItem.to_email],
      headers: {
        "X-Entity-Ref-ID": queueItem.id,
        "X-Retry-Attempt": queueItem.attempts.toString(),
      },
    };

    switch (queueItem.type) {
      case "welcome":
        return {
          ...baseData,
          subject: "🎉 Bienvenue sur Co-Parents !",
          html: this.generateSimpleWelcomeHTML(queueItem.from_user_name, queueItem.invite_code),
        };
      case "invitation":
        return {
          ...baseData,
          subject: `${queueItem.from_user_name} vous invite sur Co-Parents 👨‍👩‍👧‍👦`,
          html: this.generateSimpleInviteHTML(queueItem.from_user_name, queueItem.invite_code),
        };
      case "reset":
        return {
          ...baseData,
          subject: "🔒 Réinitialisation mot de passe Co-Parents",
          html: this.generateSimpleResetHTML(queueItem.from_user_name),
        };
      default:
        throw new Error(`Type d'email non supporté: ${queueItem.type}`);
    }
  }

  // Templates HTML simplifiés et robustes
  private generateSimpleWelcomeHTML(name: string, code: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bienvenue Co-Parents</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Co-Parents</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">L'app des familles recomposées</p>
          </div>
          
          <!-- Contenu -->
          <div style="padding: 30px;">
            <h2 style="color: #374151; margin-top: 0;">Bonjour ${name} ! 👋</h2>
            
            <p style="color: #6b7280; line-height: 1.6;">
              Votre compte Co-Parents a été créé avec succès !
            </p>
            
            <!-- Code -->
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="margin-top: 0; color: #374151;">🔑 Votre code unique :</h3>
              <div style="background: white; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 24px; font-weight: bold; color: #8b5cf6; border: 2px solid #8b5cf6;">
                ${code}
              </div>
              <p style="margin-bottom: 0; color: #6b7280; font-size: 14px;">
                Partagez ce code avec votre co-parent
              </p>
            </div>
            
            <!-- Alerte Spam -->
            <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-weight: bold; font-size: 14px;">
                🚨 IMPORTANT : VÉRIFIEZ VOTRE DOSSIER SPAM !
              </p>
              <p style="color: #92400e; margin: 5px 0 0 0; font-size: 12px;">
                90% des emails Co-Parents arrivent dans le Spam
              </p>
            </div>
            
            <!-- Bouton -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get("APP_URL") || "https://co-parents.app"}" 
                 style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Ouvrir Co-Parents
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateSimpleInviteHTML(fromName: string, code: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invitation Co-Parents</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Co-Parents</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Invitation à rejoindre</p>
          </div>
          
          <!-- Contenu -->
          <div style="padding: 30px;">
            <h2 style="color: #374151; margin-top: 0;">🎉 ${fromName} vous invite !</h2>
            
            <p style="color: #6b7280; line-height: 1.6;">
              ${fromName} utilise Co-Parents et souhaite vous connecter.
            </p>
            
            <!-- Code -->
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="margin-top: 0; color: #1e40af;">🔑 Code de connexion :</h3>
              <div style="background: white; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 24px; font-weight: bold; color: #8b5cf6; border: 2px solid #8b5cf6; text-align: center;">
                ${code}
              </div>
              <p style="margin-bottom: 0; color: #3730a3; font-size: 14px; text-align: center;">
                Entrez ce code après votre inscription
              </p>
            </div>
            
            <!-- Instructions -->
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">📱 Comment rejoindre :</h3>
              <ol style="color: #6b7280; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Téléchargez Co-Parents</li>
                <li>Créez votre compte</li>
                <li>Entrez le code ci-dessus</li>
                <li>Vous serez connectés !</li>
              </ol>
            </div>
            
            <!-- Alerte Spam -->
            <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-weight: bold; font-size: 14px;">
                🚨 VÉRIFIEZ VOTRE DOSSIER SPAM !
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateSimpleResetHTML(name: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reset Co-Parents</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Co-Parents</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #374151; margin-top: 0;">🔒 Réinitialisation</h2>
            <p style="color: #6b7280;">Cliquez pour réinitialiser votre mot de passe.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get("APP_URL") || "https://co-parents.app"}/reset-password" 
                 style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Réinitialiser
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Obtenir le statut de la queue
  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter((item) => item.status === "pending").length,
      sent: this.queue.filter((item) => item.status === "sent").length,
      failed: this.queue.filter((item) => item.status === "failed").length,
      queue: this.queue,
    };
  }

  // Nettoyer la queue (supprimer les anciens éléments)
  cleanQueue() {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const initialLength = this.queue.length;

    this.queue = this.queue.filter((item) => new Date(item.created_at).getTime() > oneDayAgo);

    const cleaned = initialLength - this.queue.length;
    console.log(`🧹 Queue nettoyée: ${cleaned} éléments supprimés`);

    return { cleaned, remaining: this.queue.length };
  }

  // Réessayer les emails échoués
  async retryFailedEmails() {
    const failedItems = this.queue.filter((item) => item.status === "failed");
    console.log(`🔄 RETRY ${failedItems.length} emails échoués...`);

    const results = [];

    for (const item of failedItems) {
      console.log(`🔄 Retry email ${item.type} vers ${item.to_email}`);

      const result = await this.sendEmailWithRetry(
        item.type,
        item.to_email,
        item.from_user_name,
        item.invite_code
      );

      results.push({ item: item.id, ...result });
    }

    return results;
  }
}

export const emailRetryService = EmailRetryService.getInstance();
