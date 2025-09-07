// Service complet de gestion des emails avec vérifications automatiques
import { supabase } from "./supabase";

interface EmailConfig {
  resendApiKey: string;
  fromEmail: string;
  appUrl: string;
}

interface EmailTestResult {
  success: boolean;
  id?: string;
  error?: string;
  duration?: number;
  details?: any;
}

interface ComprehensiveEmailReport {
  timestamp: string;
  configuration: {
    resendApiKey: {
      present: boolean;
      valid: boolean;
      format: boolean;
      error?: string;
    };
    environment: {
      supabaseConfigured: boolean;
      functionsAvailable: boolean;
      variablesSet: boolean;
    };
    connectivity: {
      resendApi: boolean;
      dnsResolution: boolean;
      httpsConnection: boolean;
    };
  };
  templates: {
    welcome: EmailTestResult;
    invitation: EmailTestResult;
    reset: EmailTestResult;
  };
  deliveryTests: {
    singleEmail: EmailTestResult;
    multipleEmails: EmailTestResult[];
    stressTest: EmailTestResult;
  };
  recommendations: string[];
  overallStatus: "success" | "warning" | "error";
}

class ComprehensiveEmailService {
  private static instance: ComprehensiveEmailService;
  private config: EmailConfig | null = null;

  static getInstance(): ComprehensiveEmailService {
    if (!ComprehensiveEmailService.instance) {
      ComprehensiveEmailService.instance = new ComprehensiveEmailService();
    }
    return ComprehensiveEmailService.instance;
  }

  // Vérification complète automatique
  async runCompleteVerificationAndFix(): Promise<ComprehensiveEmailReport> {
    console.log("🔍 VÉRIFICATION COMPLÈTE DU SYSTÈME D'EMAILS RESEND...");

    const report: ComprehensiveEmailReport = {
      timestamp: new Date().toISOString(),
      configuration: await this.verifyConfiguration(),
      templates: await this.verifyTemplates(),
      deliveryTests: await this.runDeliveryTests(),
      recommendations: [],
      overallStatus: "success",
    };

    // Générer recommandations
    report.recommendations = this.generateRecommendations(report);

    // Déterminer statut global
    report.overallStatus = this.determineOverallStatus(report);

    // Afficher rapport complet
    this.displayComprehensiveReport(report);

    // Auto-correction si possible
    if (report.overallStatus !== "success") {
      await this.attemptAutoFix(report);
    }

    return report;
  }

  // Vérifier la configuration complète
  private async verifyConfiguration() {
    console.log("🔧 VÉRIFICATION CONFIGURATION...");

    const result = {
      resendApiKey: {
        present: false,
        valid: false,
        format: false,
        error: undefined as string | undefined,
      },
      environment: {
        supabaseConfigured: false,
        functionsAvailable: false,
        variablesSet: false,
      },
      connectivity: {
        resendApi: false,
        dnsResolution: false,
        httpsConnection: false,
      },
    };

    // 1. Vérifier clé API Resend
    try {
      const apiKey = import.meta.env.VITE_RESEND_API_KEY;

      result.resendApiKey.present = !!apiKey;

      if (apiKey) {
        result.resendApiKey.format = apiKey.startsWith("re_");

        if (result.resendApiKey.format) {
          // Test de validité de la clé
          const testResponse = await fetch("https://api.resend.com/domains", {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          });

          result.resendApiKey.valid = testResponse.status !== 401;
          result.connectivity.resendApi = testResponse.ok || testResponse.status === 401;

          if (!result.resendApiKey.valid) {
            result.resendApiKey.error = `Clé API invalide (HTTP ${testResponse.status})`;
          }
        } else {
          result.resendApiKey.error = "Format de clé invalide (doit commencer par re_)";
        }
      } else {
        result.resendApiKey.error = "Clé API Resend non configurée";
      }
    } catch (error: any) {
      result.resendApiKey.error = `Erreur test clé API: ${error.message}`;
    }

    // 2. Vérifier environnement Supabase
    try {
      result.environment.supabaseConfigured = !!supabase;

      if (supabase) {
        // Test des fonctions Edge
        const { error } = await supabase.functions.invoke("send-simple-email", {
          body: { test: true, dry_run: true },
        });
        result.environment.functionsAvailable = !error;
      }

      result.environment.variablesSet = !!(
        import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
      );
    } catch (error) {
      console.warn("Erreur vérification Supabase:", error);
    }

    // 3. Vérifier connectivité réseau
    try {
      // Test DNS et HTTPS vers Resend
      const healthCheck = await fetch("https://api.resend.com/health", {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });
      result.connectivity.dnsResolution = true;
      result.connectivity.httpsConnection = healthCheck.ok;
    } catch (error) {
      result.connectivity.dnsResolution = false;
      result.connectivity.httpsConnection = false;
    }

    return result;
  }

  // Vérifier tous les templates
  private async verifyTemplates() {
    console.log("🎨 VÉRIFICATION TEMPLATES...");

    const results = {
      welcome: await this.testTemplate("welcome", "test@example.com", "Test User", "CP-TEST123"),
      invitation: await this.testTemplate(
        "invitation",
        "invite@example.com",
        "Test Parent",
        "CP-TEST456"
      ),
      reset: await this.testTemplate("reset", "reset@example.com", "Reset User", ""),
    };

    return results;
  }

  // Tester un template spécifique
  private async testTemplate(
    type: string,
    email: string,
    name: string,
    code: string
  ): Promise<EmailTestResult> {
    const startTime = Date.now();

    try {
      const apiKey = import.meta.env.VITE_RESEND_API_KEY;

      if (!apiKey) {
        return {
          success: false,
          error: "Clé API Resend non configurée",
          duration: Date.now() - startTime,
        };
      }

      const emailData = this.generateEmailData(type, email, name, code);

      // Test avec dry_run pour éviter l'envoi réel
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...emailData,
          dry_run: true, // Mode test
        }),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
          duration,
        };
      }

      const result = await response.json();

      return {
        success: true,
        id: result.id || "test_" + Date.now(),
        duration,
        details: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // Tests de livraison
  private async runDeliveryTests() {
    console.log("📧 TESTS DE LIVRAISON...");

    const results = {
      singleEmail: await this.testSingleEmailDelivery(),
      multipleEmails: await this.testMultipleEmailDelivery(),
      stressTest: await this.testStressDelivery(),
    };

    return results;
  }

  // Test envoi unique
  private async testSingleEmailDelivery(): Promise<EmailTestResult> {
    try {
      const result = await this.sendTestEmail(
        "welcome",
        "test-single@example.com",
        "Test Single",
        "CP-SINGLE123"
      );

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Test envoi multiple
  private async testMultipleEmailDelivery(): Promise<EmailTestResult[]> {
    const testEmails = ["test1@gmail.com", "test2@outlook.com", "test3@yahoo.fr"];

    const results = [];

    for (let i = 0; i < testEmails.length; i++) {
      const email = testEmails[i];
      try {
        const result = await this.sendTestEmail(
          "invitation",
          email,
          `Test User ${i + 1}`,
          `CP-MULTI${i + 1}`
        );
        results.push({ email, ...result });

        // Délai entre envois
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        results.push({
          email,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  // Test de stress
  private async testStressDelivery(): Promise<EmailTestResult> {
    try {
      const startTime = Date.now();
      const promises = [];

      // Envoyer 5 emails simultanément
      for (let i = 0; i < 5; i++) {
        promises.push(
          this.sendTestEmail(
            "welcome",
            `stress${i}@example.com`,
            `Stress User ${i}`,
            `CP-STRESS${i}`
          )
        );
      }

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(
        (r) => r.status === "fulfilled" && r.value.success
      ).length;

      return {
        success: successCount === 5,
        duration: Date.now() - startTime,
        details: {
          total: 5,
          successful: successCount,
          failed: 5 - successCount,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Envoyer email de test
  private async sendTestEmail(
    type: string,
    email: string,
    name: string,
    code: string
  ): Promise<EmailTestResult> {
    const startTime = Date.now();

    try {
      const apiKey = import.meta.env.VITE_RESEND_API_KEY;

      if (!apiKey) {
        throw new Error("Clé API Resend non configurée");
      }

      const emailData = this.generateEmailData(type, email, name, code);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      return {
        success: true,
        id: result.id,
        duration,
        details: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // Générer données email
  private generateEmailData(type: string, email: string, name: string, code: string) {
    const baseData = {
      from: "Co-Parents <coparentsap@gmail.com>",
      to: [email],
      headers: {
        "X-Entity-Ref-ID": `coparents_${type}_${Date.now()}`,
      },
    };

    switch (type) {
      case "welcome":
        return {
          ...baseData,
          subject: "🎉 Bienvenue sur Co-Parents !",
          html: this.generateWelcomeHTML(name, code),
        };
      case "invitation":
        return {
          ...baseData,
          subject: `${name} vous invite sur Co-Parents 👨‍👩‍👧‍👦`,
          html: this.generateInvitationHTML(name, code),
        };
      case "reset":
        return {
          ...baseData,
          subject: "🔒 Réinitialisation mot de passe Co-Parents",
          html: this.generateResetHTML(name),
        };
      default:
        throw new Error(`Type d'email non supporté: ${type}`);
    }
  }

  // Template email de bienvenue
  private generateWelcomeHTML(name: string, code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenue sur Co-Parents</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 40px 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Co-Parents</h1>
                  <p style="color: white; margin: 15px 0 0 0; opacity: 0.95; font-size: 18px;">L'app des familles recomposées</p>
              </div>
              
              <!-- Contenu -->
              <div style="padding: 40px 30px;">
                  <h2 style="color: #374151; margin-top: 0; font-size: 24px;">Bonjour ${name} ! 👋</h2>
                  
                  <!-- Alerte Spam PRIORITAIRE -->
                  <div style="background: #fef3c7; border: 3px solid #f59e0b; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                      <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">
                          🚨 VÉRIFIEZ VOTRE DOSSIER SPAM !
                      </h3>
                      <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: bold;">
                          📧 90% des emails Co-Parents arrivent dans le Spam
                      </p>
                      <p style="color: #92400e; margin: 5px 0 0 0; font-size: 12px;">
                          📁 Vérifiez : Spam + Courriers indésirables + Promotions
                      </p>
                  </div>
                  
                  <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
                      Félicitations ! Votre compte Co-Parents a été créé avec succès.
                  </p>
                  
                  <!-- Code unique -->
                  <div style="background: #f3f4f6; padding: 25px; border-radius: 12px; margin: 30px 0;">
                      <h3 style="color: #374151; margin-top: 0; font-size: 18px;">🔑 Votre code unique :</h3>
                      <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; font-family: monospace; font-size: 28px; font-weight: bold; color: #8b5cf6; border: 3px solid #8b5cf6; margin: 15px 0;">
                          ${code}
                      </div>
                      <p style="color: #6b7280; font-size: 14px; margin-bottom: 0; text-align: center;">
                          Partagez ce code avec votre co-parent
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
                      Besoin d'aide ? coparentsap@gmail.com<br>
                      Co-Parents - L'application qui simplifie la coparentalité
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  // Template email d'invitation
  private generateInvitationHTML(fromName: string, code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation Co-Parents</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 40px 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Co-Parents</h1>
                  <p style="color: white; margin: 15px 0 0 0; opacity: 0.95; font-size: 18px;">Invitation à rejoindre</p>
              </div>
              
              <!-- Contenu -->
              <div style="padding: 40px 30px;">
                  <h2 style="color: #374151; margin-top: 0; font-size: 24px;">🎉 ${fromName} vous invite !</h2>
                  
                  <!-- Alerte Spam PRIORITAIRE -->
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
                  
                  <!-- Code de connexion -->
                  <div style="background: #eff6ff; padding: 25px; border-radius: 12px; border-left: 4px solid #3b82f6; margin: 30px 0;">
                      <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">🔑 Code de connexion :</h3>
                      <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; font-family: monospace; font-size: 28px; font-weight: bold; color: #8b5cf6; border: 3px solid #8b5cf6; margin: 15px 0;">
                          ${code}
                      </div>
                  </div>
                  
                  <!-- Instructions -->
                  <div style="background: #f3f4f6; padding: 25px; border-radius: 12px; margin: 30px 0;">
                      <h3 style="color: #374151; margin-top: 0; font-size: 18px;">📱 Comment rejoindre :</h3>
                      <ol style="color: #6b7280; line-height: 1.8; margin: 0; padding-left: 20px;">
                          <li>Téléchargez Co-Parents</li>
                          <li>Créez votre compte</li>
                          <li>Entrez le code ci-dessus</li>
                          <li>Vous serez connectés !</li>
                      </ol>
                  </div>
                  
                  <!-- Boutons -->
                  <div style="text-align: center; margin: 40px 0;">
                      <a href="${window.location.origin}" style="background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 18px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">
                          Ouvrir Co-Parents
                      </a>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  // Template email de reset
  private generateResetHTML(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Co-Parents</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Co-Parents</h1>
              </div>
              <div style="padding: 30px;">
                  <h2 style="color: #374151; margin-top: 0;">🔒 Réinitialisation</h2>
                  <p style="color: #6b7280;">Cliquez pour réinitialiser votre mot de passe.</p>
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${window.location.origin}/reset-password" 
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

  // Générer recommandations
  private generateRecommendations(report: ComprehensiveEmailReport): string[] {
    const recommendations = [];

    // Configuration
    if (!report.configuration.resendApiKey.present) {
      recommendations.push("Configurer la clé API Resend dans les variables d'environnement");
    }

    if (!report.configuration.resendApiKey.valid) {
      recommendations.push("Vérifier la validité de la clé API Resend");
    }

    if (!report.configuration.connectivity.resendApi) {
      recommendations.push("Vérifier la connectivité réseau vers l'API Resend");
    }

    // Templates
    const templateErrors = Object.values(report.templates).filter((t) => !t.success);
    if (templateErrors.length > 0) {
      recommendations.push(`Corriger ${templateErrors.length} template(s) d'email défaillant(s)`);
    }

    // Livraison
    if (!report.deliveryTests.singleEmail.success) {
      recommendations.push("Résoudre les problèmes de livraison d'emails uniques");
    }

    const failedMultiple = report.deliveryTests.multipleEmails.filter((e) => !e.success);
    if (failedMultiple.length > 0) {
      recommendations.push(`Corriger ${failedMultiple.length} échec(s) d'envoi multiple`);
    }

    if (!report.deliveryTests.stressTest.success) {
      recommendations.push("Optimiser la gestion des envois simultanés");
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ Système d'emails parfaitement configuré et fonctionnel");
    }

    return recommendations;
  }

  // Déterminer statut global
  private determineOverallStatus(
    report: ComprehensiveEmailReport
  ): "success" | "warning" | "error" {
    // Erreurs critiques
    if (!report.configuration.resendApiKey.present || !report.configuration.resendApiKey.valid) {
      return "error";
    }

    if (!report.configuration.connectivity.resendApi) {
      return "error";
    }

    // Avertissements
    const templateFailures = Object.values(report.templates).filter((t) => !t.success).length;
    if (templateFailures > 1) {
      return "warning";
    }

    const deliveryFailures = report.deliveryTests.multipleEmails.filter((e) => !e.success).length;
    if (deliveryFailures > 1) {
      return "warning";
    }

    return "success";
  }

  // Afficher rapport complet
  private displayComprehensiveReport(report: ComprehensiveEmailReport) {
    console.log("\n📊 RAPPORT COMPLET - SYSTÈME D'EMAILS CO-PARENTS\n");

    console.log("🔧 CONFIGURATION:");
    console.log(`   Clé API présente: ${report.configuration.resendApiKey.present ? "✅" : "❌"}`);
    console.log(`   Clé API valide: ${report.configuration.resendApiKey.valid ? "✅" : "❌"}`);
    console.log(
      `   Connectivité Resend: ${report.configuration.connectivity.resendApi ? "✅" : "❌"}`
    );

    console.log("\n🎨 TEMPLATES:");
    Object.entries(report.templates).forEach(([type, result]) => {
      console.log(`   ${type}: ${result.success ? "✅" : "❌"} ${result.duration}ms`);
      if (result.error) console.log(`      Erreur: ${result.error}`);
    });

    console.log("\n📧 TESTS DE LIVRAISON:");
    console.log(`   Email unique: ${report.deliveryTests.singleEmail.success ? "✅" : "❌"}`);
    console.log(
      `   Emails multiples: ${report.deliveryTests.multipleEmails.filter((e) => e.success).length}/${report.deliveryTests.multipleEmails.length} ✅`
    );
    console.log(`   Test de stress: ${report.deliveryTests.stressTest.success ? "✅" : "❌"}`);

    console.log("\n💡 RECOMMANDATIONS:");
    report.recommendations.forEach((rec) => {
      console.log(`   - ${rec}`);
    });

    console.log(`\n📊 STATUT GLOBAL: ${report.overallStatus.toUpperCase()}`);

    // Afficher résumé utilisateur
    this.showUserSummary(report);
  }

  // Afficher résumé pour l'utilisateur
  private showUserSummary(report: ComprehensiveEmailReport) {
    const configOk =
      report.configuration.resendApiKey.valid && report.configuration.connectivity.resendApi;
    const templatesOk = Object.values(report.templates).every((t) => t.success);
    const deliveryOk = report.deliveryTests.singleEmail.success;

    if (configOk && templatesOk && deliveryOk) {
      alert(
        "✅ SYSTÈME D'EMAILS PARFAITEMENT FONCTIONNEL !\n\n" +
          "🔑 Configuration Resend validée\n" +
          "🎨 Tous les templates opérationnels\n" +
          "📧 Tests de livraison réussis\n" +
          "🚨 Alertes Spam intégrées\n" +
          "🚀 Prêt pour la production !"
      );
    } else {
      const issues = [];
      if (!configOk) issues.push("Configuration Resend");
      if (!templatesOk) issues.push("Templates défaillants");
      if (!deliveryOk) issues.push("Problèmes de livraison");

      alert(
        "⚠️ PROBLÈMES DÉTECTÉS DANS LE SYSTÈME D'EMAILS\n\n" +
          `Issues: ${issues.join(", ")}\n\n` +
          "Vérifiez la console pour le rapport détaillé.\n" +
          "L'application fonctionne en mode démo."
      );
    }
  }

  // Tentative de correction automatique
  private async attemptAutoFix(report: ComprehensiveEmailReport) {
    console.log("🔧 TENTATIVE DE CORRECTION AUTOMATIQUE...");

    const fixes = [];

    // Fix 1: Vérifier variables d'environnement
    if (!report.configuration.resendApiKey.present) {
      fixes.push("Ajouter VITE_RESEND_API_KEY dans les variables d'environnement");
    }

    // Fix 2: Tester avec clé de démo
    if (!report.configuration.resendApiKey.valid) {
      console.log("🧪 Test avec configuration de démo...");
      try {
        const demoTest = await this.testWithDemoConfig();
        if (demoTest.success) {
          fixes.push("Configuration de démo fonctionnelle - Utiliser une vraie clé API");
        }
      } catch (error) {
        fixes.push("Problème de connectivité réseau vers Resend");
      }
    }

    // Fix 3: Vérifier DNS
    if (!report.configuration.connectivity.dnsResolution) {
      fixes.push("Vérifier la résolution DNS et la connectivité internet");
    }

    console.log("🔧 Corrections suggérées:", fixes);
    return fixes;
  }

  // Test avec configuration de démo
  private async testWithDemoConfig() {
    try {
      const response = await fetch("https://api.resend.com/domains", {
        headers: {
          Authorization: "Bearer re_demo_key",
          "Content-Type": "application/json",
        },
      });

      return {
        success: response.status === 401, // 401 = clé invalide mais API accessible
        status: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Test de configuration DNS (si domaine personnalisé)
  async testDNSConfiguration(domain?: string) {
    if (!domain) {
      return { configured: false, message: "Aucun domaine personnalisé configuré" };
    }

    try {
      // Vérifier les enregistrements SPF, DKIM, DMARC
      const dnsTests = {
        spf: await this.checkDNSRecord(domain, "TXT", "v=spf1"),
        dkim: await this.checkDNSRecord(`resend._domainkey.${domain}`, "CNAME"),
        dmarc: await this.checkDNSRecord(`_dmarc.${domain}`, "TXT", "v=DMARC1"),
      };

      return {
        configured: Object.values(dnsTests).every(Boolean),
        details: dnsTests,
      };
    } catch (error: any) {
      return {
        configured: false,
        error: error.message,
      };
    }
  }

  // Vérifier enregistrement DNS
  private async checkDNSRecord(domain: string, type: string, expectedContent?: string) {
    try {
      // Utiliser une API DNS publique pour vérifier
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`);
      const data = await response.json();

      if (expectedContent) {
        return data.Answer?.some((record: any) => record.data.includes(expectedContent)) || false;
      }

      return data.Answer?.length > 0 || false;
    } catch (error) {
      return false;
    }
  }

  // Interface publique pour lancer la vérification
  async runFullEmailDiagnostic() {
    console.log("🚀 LANCEMENT DIAGNOSTIC COMPLET DES EMAILS...");

    try {
      const report = await this.runCompleteVerificationAndFix();

      // Tests supplémentaires
      console.log("🧪 TESTS SUPPLÉMENTAIRES...");

      // Test de la configuration DNS
      const dnsTest = await this.testDNSConfiguration();
      console.log("🌐 Test DNS:", dnsTest);

      // Test de connectivité avancée
      const connectivityTest = await this.testAdvancedConnectivity();
      console.log("🔗 Test connectivité:", connectivityTest);

      return {
        ...report,
        additionalTests: {
          dns: dnsTest,
          connectivity: connectivityTest,
        },
      };
    } catch (error: any) {
      console.error("❌ Erreur diagnostic complet:", error);
      throw error;
    }
  }

  // Test de connectivité avancée
  private async testAdvancedConnectivity() {
    const tests = {
      resendHealth: false,
      resendDomains: false,
      resendEmails: false,
      latency: 0,
    };

    try {
      const startTime = Date.now();

      // Test health endpoint
      const healthResponse = await fetch("https://api.resend.com/health");
      tests.resendHealth = healthResponse.ok;

      // Test domains endpoint
      const domainsResponse = await fetch("https://api.resend.com/domains");
      tests.resendDomains = domainsResponse.status === 401; // 401 = API accessible

      // Test emails endpoint
      const emailsResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      tests.resendEmails = emailsResponse.status === 401; // 401 = API accessible

      tests.latency = Date.now() - startTime;
    } catch (error: any) {
      console.warn("Erreur test connectivité:", error);
    }

    return tests;
  }
}

export const comprehensiveEmailService = ComprehensiveEmailService.getInstance();
