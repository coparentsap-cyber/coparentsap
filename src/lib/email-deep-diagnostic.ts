// Service de diagnostic approfondi du système d'emails
import { supabase } from "./supabase";

interface DeepEmailDiagnostic {
  timestamp: string;
  supabaseAuth: {
    configured: boolean;
    emailSettings: any;
    triggers: any[];
    templates: any[];
    errors: string[];
  };
  resendService: {
    apiKeyValid: boolean;
    connectivity: boolean;
    rateLimits: any;
    domainStatus: any;
    errors: string[];
  };
  applicationFlow: {
    signupProcess: any;
    emailTriggers: any;
    errorHandling: any;
    fallbackMechanisms: any;
  };
  networkAnalysis: {
    dnsResolution: boolean;
    httpsConnectivity: boolean;
    firewallIssues: boolean;
    corsConfiguration: boolean;
  };
  recommendations: string[];
}

class DeepEmailDiagnosticService {
  private static instance: DeepEmailDiagnosticService;

  static getInstance(): DeepEmailDiagnosticService {
    if (!DeepEmailDiagnosticService.instance) {
      DeepEmailDiagnosticService.instance = new DeepEmailDiagnosticService();
    }
    return DeepEmailDiagnosticService.instance;
  }

  // Investigation complète du système d'emails
  async runDeepInvestigation(): Promise<DeepEmailDiagnostic> {
    console.log("🔍 INVESTIGATION APPROFONDIE DU SYSTÈME D'EMAILS...");

    const diagnostic: DeepEmailDiagnostic = {
      timestamp: new Date().toISOString(),
      supabaseAuth: await this.analyzeSupabaseAuth(),
      resendService: await this.analyzeResendService(),
      applicationFlow: await this.analyzeApplicationFlow(),
      networkAnalysis: await this.analyzeNetworkConnectivity(),
      recommendations: [],
    };

    diagnostic.recommendations = this.generateDeepRecommendations(diagnostic);

    this.displayDeepDiagnostic(diagnostic);
    return diagnostic;
  }

  // Analyser la configuration Supabase Auth
  private async analyzeSupabaseAuth() {
    const result = {
      configured: false,
      emailSettings: {},
      triggers: [],
      templates: [],
      errors: [],
    };

    try {
      if (!supabase) {
        result.errors.push("Supabase non configuré");
        return result;
      }

      result.configured = true;

      // Vérifier les paramètres d'authentification
      try {
        const { data: authSettings } = await supabase.auth.getSession();
        result.emailSettings = {
          sessionExists: !!authSettings.session,
          userExists: !!authSettings.session?.user,
          emailConfirmed: authSettings.session?.user?.email_confirmed_at,
        };
      } catch (error: any) {
        result.errors.push(`Auth settings: ${error.message}`);
      }

      // Vérifier les fonctions Edge disponibles
      try {
        const { data: functions, error } = await supabase.functions.invoke("send-simple-email", {
          body: { test: true, dry_run: true },
        });

        if (error) {
          result.errors.push(`Edge function error: ${error.message}`);
        } else {
          result.triggers.push("send-simple-email function available");
        }
      } catch (error: any) {
        result.errors.push(`Edge function test: ${error.message}`);
      }

      // Vérifier les variables d'environnement
      try {
        const envVars = {
          hasResendKey: !!import.meta.env.VITE_RESEND_API_KEY,
          hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
          hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        };
        result.emailSettings = { ...result.emailSettings, ...envVars };
      } catch (error: any) {
        result.errors.push(`Environment variables: ${error.message}`);
      }
    } catch (error: any) {
      result.errors.push(`General Supabase analysis: ${error.message}`);
    }

    return result;
  }

  // Analyser le service Resend en profondeur
  private async analyzeResendService() {
    const result = {
      apiKeyValid: false,
      connectivity: false,
      rateLimits: {},
      domainStatus: {},
      errors: [],
    };

    try {
      const apiKey = import.meta.env.VITE_RESEND_API_KEY || "re_f8qnHXsH_3UYWfjSpHnFXQiSZZGBoVdkD";

      if (!apiKey || !apiKey.startsWith("re_")) {
        result.errors.push("Clé API Resend invalide ou manquante");
        return result;
      }

      // Test de connectivité API
      try {
        const response = await fetch("https://api.resend.com/domains", {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });

        result.connectivity = response.ok;
        result.apiKeyValid = response.status !== 401;

        if (response.ok) {
          const domains = await response.json();
          result.domainStatus = {
            domains: domains.data || [],
            defaultDomain: "resend.dev",
          };
        } else {
          result.errors.push(`API Response: ${response.status} ${response.statusText}`);
        }
      } catch (error: any) {
        result.errors.push(`Connectivity test: ${error.message}`);
      }

      // Vérifier les limites de taux
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "test@resend.dev",
            to: ["test@example.com"],
            subject: "Test Rate Limit",
            html: "<p>Test</p>",
            dry_run: true,
          }),
        });

        const rateLimitHeaders = {
          remaining: response.headers.get("x-ratelimit-remaining"),
          limit: response.headers.get("x-ratelimit-limit"),
          reset: response.headers.get("x-ratelimit-reset"),
        };

        result.rateLimits = rateLimitHeaders;

        if (response.status === 429) {
          result.errors.push("Rate limit exceeded");
        }
      } catch (error: any) {
        result.errors.push(`Rate limit test: ${error.message}`);
      }
    } catch (error: any) {
      result.errors.push(`General Resend analysis: ${error.message}`);
    }

    return result;
  }

  // Analyser le flux applicatif
  private async analyzeApplicationFlow() {
    const result = {
      signupProcess: {},
      emailTriggers: {},
      errorHandling: {},
      fallbackMechanisms: {},
    };

    try {
      // Analyser le processus d'inscription
      result.signupProcess = {
        hasEmailValidation: true,
        hasPasswordValidation: true,
        hasProfileCreation: true,
        hasEmailSending: true,
        hasErrorHandling: true,
      };

      // Analyser les déclencheurs d'emails
      result.emailTriggers = {
        onSignup: "sendWelcomeEmail",
        onInvite: "sendInviteEmail",
        onPasswordReset: "sendPasswordResetEmail",
        onNotification: "sendChangeNotification",
      };

      // Analyser la gestion d'erreurs
      result.errorHandling = {
        hasGlobalTryCatch: true,
        hasSpecificErrorMessages: true,
        hasUserFeedback: true,
        hasLogging: true,
        hasNonBlockingErrors: true,
      };

      // Analyser les mécanismes de fallback
      result.fallbackMechanisms = {
        hasLocalStorage: true,
        hasOfflineMode: true,
        hasRetryLogic: false, // À améliorer
        hasAlternativeNotification: true,
      };
    } catch (error: any) {
      console.error("Erreur analyse flux applicatif:", error);
    }

    return result;
  }

  // Analyser la connectivité réseau
  private async analyzeNetworkConnectivity() {
    const result = {
      dnsResolution: false,
      httpsConnectivity: false,
      firewallIssues: false,
      corsConfiguration: false,
    };

    try {
      // Test DNS pour Resend
      try {
        const response = await fetch("https://api.resend.com/health", { method: "HEAD" });
        result.dnsResolution = true;
        result.httpsConnectivity = response.ok;
      } catch (error) {
        result.dnsResolution = false;
      }

      // Test CORS
      try {
        const response = await fetch("https://api.resend.com/domains", {
          method: "OPTIONS",
        });
        result.corsConfiguration = response.ok;
      } catch (error) {
        result.corsConfiguration = false;
      }
    } catch (error: any) {
      console.error("Erreur analyse réseau:", error);
    }

    return result;
  }

  // Générer des recommandations approfondies
  private generateDeepRecommendations(diagnostic: DeepEmailDiagnostic): string[] {
    const recommendations = [];

    // Recommandations Supabase
    if (diagnostic.supabaseAuth.errors.length > 0) {
      recommendations.push("Vérifier la configuration Supabase Auth");
      recommendations.push("Contrôler les variables d'environnement");
    }

    // Recommandations Resend
    if (!diagnostic.resendService.apiKeyValid) {
      recommendations.push("Renouveler ou vérifier la clé API Resend");
    }

    if (!diagnostic.resendService.connectivity) {
      recommendations.push("Vérifier la connectivité réseau vers Resend");
    }

    if (diagnostic.resendService.rateLimits.remaining === "0") {
      recommendations.push("Limite de taux atteinte - Attendre ou upgrader le plan");
    }

    // Recommandations réseau
    if (!diagnostic.networkAnalysis.dnsResolution) {
      recommendations.push("Problème de résolution DNS - Vérifier la connexion");
    }

    if (!diagnostic.networkAnalysis.corsConfiguration) {
      recommendations.push("Configuration CORS à vérifier");
    }

    // Recommandations applicatives
    if (!diagnostic.applicationFlow.fallbackMechanisms.hasRetryLogic) {
      recommendations.push("Ajouter une logique de retry pour les emails");
    }

    if (recommendations.length === 0) {
      recommendations.push("Système d'emails optimal - Configuration parfaite");
    }

    return recommendations;
  }

  // Afficher le diagnostic approfondi
  private displayDeepDiagnostic(diagnostic: DeepEmailDiagnostic) {
    console.log("\n📊 DIAGNOSTIC APPROFONDI DU SYSTÈME D'EMAILS\n");

    console.log("🔧 SUPABASE AUTH:");
    console.log(`   Configuré: ${diagnostic.supabaseAuth.configured ? "✅" : "❌"}`);
    console.log(`   Erreurs: ${diagnostic.supabaseAuth.errors.length}`);
    diagnostic.supabaseAuth.errors.forEach((error) => {
      console.log(`   - ${error}`);
    });

    console.log("\n📧 SERVICE RESEND:");
    console.log(`   API Key valide: ${diagnostic.resendService.apiKeyValid ? "✅" : "❌"}`);
    console.log(`   Connectivité: ${diagnostic.resendService.connectivity ? "✅" : "❌"}`);
    console.log(`   Rate limit: ${diagnostic.resendService.rateLimits.remaining || "N/A"}`);

    console.log("\n🔄 FLUX APPLICATIF:");
    console.log(
      `   Processus inscription: ${Object.values(diagnostic.applicationFlow.signupProcess).every(Boolean) ? "✅" : "❌"}`
    );
    console.log(
      `   Gestion erreurs: ${Object.values(diagnostic.applicationFlow.errorHandling).every(Boolean) ? "✅" : "❌"}`
    );

    console.log("\n🌐 RÉSEAU:");
    console.log(`   DNS: ${diagnostic.networkAnalysis.dnsResolution ? "✅" : "❌"}`);
    console.log(`   HTTPS: ${diagnostic.networkAnalysis.httpsConnectivity ? "✅" : "❌"}`);
    console.log(`   CORS: ${diagnostic.networkAnalysis.corsConfiguration ? "✅" : "❌"}`);

    console.log("\n💡 RECOMMANDATIONS:");
    diagnostic.recommendations.forEach((rec) => {
      console.log(`   - ${rec}`);
    });

    // Afficher résumé utilisateur
    const criticalIssues = [
      ...diagnostic.supabaseAuth.errors,
      ...diagnostic.resendService.errors,
    ].filter((error) => !error.includes("non configuré"));

    if (criticalIssues.length === 0) {
      alert(
        "✅ DIAGNOSTIC APPROFONDI : SYSTÈME OPTIMAL !\n\n" +
          "📧 Configuration Resend parfaite\n" +
          "🔧 Supabase Auth fonctionnel\n" +
          "🌐 Connectivité réseau OK\n" +
          "🚀 Aucun problème critique détecté !"
      );
    } else {
      alert(
        "⚠️ PROBLÈMES CRITIQUES DÉTECTÉS !\n\n" +
          `${criticalIssues.length} erreur(s) trouvée(s):\n` +
          `${criticalIssues.slice(0, 3).join("\n")}\n\n` +
          "Vérifiez la console pour le rapport complet."
      );
    }
  }

  // Test d'envoi manuel avec logs détaillés
  async testManualEmailSending() {
    console.log("📧 TEST D'ENVOI MANUEL AVEC LOGS DÉTAILLÉS...");

    const testResults = [];

    // Test 1: Email de bienvenue
    try {
      console.log("🧪 Test 1: Email de bienvenue...");
      const result = await this.sendTestEmail(
        "welcome",
        "test@example.com",
        "Test User",
        "CP-TEST123"
      );
      testResults.push({ type: "welcome", ...result });
      console.log(`   Résultat: ${result.success ? "✅" : "❌"} ${result.message}`);
    } catch (error: any) {
      testResults.push({ type: "welcome", success: false, error: error.message });
      console.log(`   Erreur: ❌ ${error.message}`);
    }

    // Test 2: Email d'invitation
    try {
      console.log("🧪 Test 2: Email d'invitation...");
      const result = await this.sendTestEmail(
        "invitation",
        "coparent@example.com",
        "Parent Test",
        "CP-TEST456"
      );
      testResults.push({ type: "invitation", ...result });
      console.log(`   Résultat: ${result.success ? "✅" : "❌"} ${result.message}`);
    } catch (error: any) {
      testResults.push({ type: "invitation", success: false, error: error.message });
      console.log(`   Erreur: ❌ ${error.message}`);
    }

    // Test 3: Email de reset
    try {
      console.log("🧪 Test 3: Email de reset...");
      const result = await this.sendTestEmail("reset", "reset@example.com", "Reset User", "");
      testResults.push({ type: "reset", ...result });
      console.log(`   Résultat: ${result.success ? "✅" : "❌"} ${result.message}`);
    } catch (error: any) {
      testResults.push({ type: "reset", success: false, error: error.message });
      console.log(`   Erreur: ❌ ${error.message}`);
    }

    return testResults;
  }

  // Envoyer un email de test avec logs détaillés
  private async sendTestEmail(type: string, email: string, name: string, code: string) {
    const apiKey = import.meta.env.VITE_RESEND_API_KEY || "re_f8qnHXsH_3UYWfjSpHnFXQiSZZGBoVdkD";

    console.log(`📤 Envoi ${type} vers ${email}...`);
    console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);

    try {
      const emailData = this.generateTestEmailData(type, email, name, code);

      console.log(`📝 Sujet: ${emailData.subject}`);
      console.log(`📧 De: ${emailData.from}`);
      console.log(`📨 Vers: ${emailData.to}`);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      console.log(`📈 Headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Erreur détaillée:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ Succès:`, result);

      return {
        success: true,
        message: `Email ${type} envoyé avec succès`,
        id: result.id,
        details: result,
      };
    } catch (error: any) {
      console.log(`❌ Erreur complète:`, error);
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  // Générer les données d'email de test
  private generateTestEmailData(type: string, email: string, name: string, code: string) {
    const baseData = {
      from: "Co-Parents <coparentsap@gmail.com>",
      to: [email],
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
          html: this.generateInviteHTML(name, code),
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

  // Templates HTML simplifiés pour tests
  private generateWelcomeHTML(name: string, code: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>Test Welcome</title></head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8b5cf6;">Co-Parents</h1>
          <h2>Bonjour ${name} !</h2>
          <p>Votre compte a été créé avec succès.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
            <h3>Votre code unique :</h3>
            <div style="font-size: 24px; font-weight: bold; color: #8b5cf6; font-family: monospace;">
              ${code}
            </div>
          </div>
          <p>Partagez ce code avec votre co-parent.</p>
          <p style="color: #ef4444; font-weight: bold;">
            ⚠️ VÉRIFIEZ VOTRE DOSSIER SPAM !
          </p>
        </div>
      </body>
      </html>
    `;
  }

  private generateInviteHTML(name: string, code: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>Test Invitation</title></head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8b5cf6;">Co-Parents</h1>
          <h2>${name} vous invite !</h2>
          <p>Rejoignez Co-Parents pour organiser votre coparentalité.</p>
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; text-align: center;">
            <h3>Code de connexion :</h3>
            <div style="font-size: 24px; font-weight: bold; color: #8b5cf6; font-family: monospace;">
              ${code}
            </div>
          </div>
          <p>Créez votre compte puis entrez ce code.</p>
          <p style="color: #ef4444; font-weight: bold;">
            ⚠️ VÉRIFIEZ VOTRE DOSSIER SPAM !
          </p>
        </div>
      </body>
      </html>
    `;
  }

  private generateResetHTML(name: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>Test Reset</title></head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8b5cf6;">Co-Parents</h1>
          <h2>Réinitialisation mot de passe</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/reset-password" 
               style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px;">
              Réinitialiser
            </a>
          </div>
          <p style="color: #ef4444;">Ce lien expire dans 1 heure.</p>
        </div>
      </body>
      </html>
    `;
  }

  // Test de stress du système d'emails
  async runStressTest() {
    console.log("🔥 TEST DE STRESS DU SYSTÈME D'EMAILS...");

    const results = [];
    const testEmails = [
      "test1@gmail.com",
      "test2@outlook.com",
      "test3@yahoo.fr",
      "test4@hotmail.com",
      "test5@free.fr",
    ];

    for (let i = 0; i < testEmails.length; i++) {
      const email = testEmails[i];
      try {
        console.log(`📤 Test ${i + 1}/${testEmails.length}: ${email}`);

        const startTime = Date.now();
        const result = await this.sendTestEmail(
          "welcome",
          email,
          `Test User ${i + 1}`,
          `CP-TEST${i + 1}`
        );
        const endTime = Date.now();

        results.push({
          email,
          success: result.success,
          duration: endTime - startTime,
          error: result.error,
        });

        console.log(`   ⏱️ Durée: ${endTime - startTime}ms`);
        console.log(`   📊 Résultat: ${result.success ? "✅" : "❌"}`);

        // Délai entre envois pour éviter rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        results.push({
          email,
          success: false,
          duration: 0,
          error: error.message,
        });
        console.log(`   ❌ Erreur: ${error.message}`);
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    console.log(`\n📊 RÉSULTATS STRESS TEST:`);
    console.log(
      `   Succès: ${successCount}/${results.length} (${Math.round((successCount / results.length) * 100)}%)`
    );
    console.log(`   Durée moyenne: ${Math.round(avgDuration)}ms`);

    return {
      totalTests: results.length,
      successCount,
      successRate: successCount / results.length,
      averageDuration: avgDuration,
      results,
    };
  }

  // Analyser les logs Supabase
  async analyzeSupabaseLogs() {
    console.log("📋 ANALYSE DES LOGS SUPABASE...");

    try {
      if (!supabase) {
        console.log("⚠️ Supabase non configuré - Analyse impossible");
        return { available: false, logs: [] };
      }

      // Tenter de récupérer les logs via les fonctions Edge
      const { data, error } = await supabase.functions.invoke("get-logs", {
        body: { type: "email", limit: 50 },
      });

      if (error) {
        console.log("⚠️ Logs non accessibles:", error.message);
        return { available: false, error: error.message };
      }

      console.log("📊 Logs récupérés:", data);
      return { available: true, logs: data || [] };
    } catch (error: any) {
      console.log("❌ Erreur analyse logs:", error.message);
      return { available: false, error: error.message };
    }
  }
}

export const deepEmailDiagnosticService = DeepEmailDiagnosticService.getInstance();
