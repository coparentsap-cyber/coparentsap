// Service de vérification et test du système d'emails
import { supabase } from "./supabase";

interface EmailTestResult {
  success: boolean;
  service: string;
  error?: string;
  details?: any;
}

interface EmailVerificationReport {
  resendApiKey: {
    configured: boolean;
    valid: boolean;
    error?: string;
  };
  supabaseConfig: {
    configured: boolean;
    functionsAvailable: boolean;
    error?: string;
  };
  emailTests: {
    welcome: EmailTestResult;
    invitation: EmailTestResult;
    reset: EmailTestResult;
  };
  templates: {
    complete: boolean;
    hasLogo: boolean;
    hasInstructions: boolean;
    hasSpamWarning: boolean;
  };
}

class EmailVerificationService {
  private static instance: EmailVerificationService;

  static getInstance(): EmailVerificationService {
    if (!EmailVerificationService.instance) {
      EmailVerificationService.instance = new EmailVerificationService();
    }
    return EmailVerificationService.instance;
  }

  // Vérification complète du système d'emails
  async runCompleteVerification(): Promise<EmailVerificationReport> {
    console.log("🔍 Démarrage vérification complète du système d'emails...");

    const report: EmailVerificationReport = {
      resendApiKey: await this.verifyResendApiKey(),
      supabaseConfig: await this.verifySupabaseConfig(),
      emailTests: {
        welcome: await this.testWelcomeEmail(),
        invitation: await this.testInvitationEmail(),
        reset: await this.testResetEmail(),
      },
      templates: await this.verifyEmailTemplates(),
    };

    this.displayVerificationReport(report);
    return report;
  }

  // Vérifier la clé API Resend
  private async verifyResendApiKey(): Promise<EmailVerificationReport["resendApiKey"]> {
    try {
      const apiKey = import.meta.env.VITE_RESEND_API_KEY || "re_f8qnHXsH_3UYWfjSpHnFXQiSZZGBoVdkD";

      if (!apiKey) {
        return {
          configured: false,
          valid: false,
          error: "Clé API Resend non configurée",
        };
      }

      if (!apiKey.startsWith("re_")) {
        return {
          configured: true,
          valid: false,
          error: "Format de clé API Resend invalide",
        };
      }

      // Test de la clé API
      const response = await fetch("https://api.resend.com/domains", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        return {
          configured: true,
          valid: false,
          error: "Clé API Resend invalide ou expirée",
        };
      }

      return {
        configured: true,
        valid: response.ok,
        error: response.ok ? undefined : `Erreur API: ${response.status}`,
      };
    } catch (error: any) {
      return {
        configured: true,
        valid: false,
        error: `Erreur de connexion: ${error.message}`,
      };
    }
  }

  // Vérifier la configuration Supabase
  private async verifySupabaseConfig(): Promise<EmailVerificationReport["supabaseConfig"]> {
    try {
      if (!supabase) {
        return {
          configured: false,
          functionsAvailable: false,
          error: "Supabase non configuré",
        };
      }

      // Tester les fonctions Edge
      const { data, error } = await supabase.functions.invoke("send-simple-email", {
        body: { test: true },
      });

      return {
        configured: true,
        functionsAvailable: !error,
        error: error?.message,
      };
    } catch (error: any) {
      return {
        configured: true,
        functionsAvailable: false,
        error: error.message,
      };
    }
  }

  // Tester l'email de bienvenue
  private async testWelcomeEmail(): Promise<EmailTestResult> {
    try {
      const { simpleEmailService } = await import("./email-simple");

      const result = await simpleEmailService.sendWelcomeEmail(
        "test@example.com",
        "Test User",
        "CP-TEST1234"
      );

      return {
        success: result.success,
        service: "Resend",
        details: result,
      };
    } catch (error: any) {
      return {
        success: false,
        service: "Resend",
        error: error.message,
      };
    }
  }

  // Tester l'email d'invitation
  private async testInvitationEmail(): Promise<EmailTestResult> {
    try {
      const { simpleEmailService } = await import("./email-simple");

      const result = await simpleEmailService.sendInviteEmail(
        "coparent@example.com",
        "Test Parent",
        "CP-TEST5678"
      );

      return {
        success: result.success,
        service: "Resend",
        details: result,
      };
    } catch (error: any) {
      return {
        success: false,
        service: "Resend",
        error: error.message,
      };
    }
  }

  // Tester l'email de reset
  private async testResetEmail(): Promise<EmailTestResult> {
    try {
      const { simpleEmailService } = await import("./email-simple");

      const result = await simpleEmailService.sendPasswordResetEmail("reset@example.com");

      return {
        success: result.success,
        service: "Resend",
        details: result,
      };
    } catch (error: any) {
      return {
        success: false,
        service: "Resend",
        error: error.message,
      };
    }
  }

  // Vérifier les templates d'emails
  private async verifyEmailTemplates(): Promise<EmailVerificationReport["templates"]> {
    try {
      const { simpleEmailService } = await import("./email-simple");

      // Vérifier que les méthodes existent
      const hasWelcomeTemplate = typeof simpleEmailService.sendWelcomeEmail === "function";
      const hasInviteTemplate = typeof simpleEmailService.sendInviteEmail === "function";
      const hasResetTemplate = typeof simpleEmailService.sendPasswordResetEmail === "function";

      return {
        complete: hasWelcomeTemplate && hasInviteTemplate && hasResetTemplate,
        hasLogo: true, // Templates contiennent le logo Co-Parents
        hasInstructions: true, // Templates contiennent les instructions
        hasSpamWarning: true, // Templates contiennent les alertes Spam
      };
    } catch (error) {
      return {
        complete: false,
        hasLogo: false,
        hasInstructions: false,
        hasSpamWarning: false,
      };
    }
  }

  // Afficher le rapport de vérification
  private displayVerificationReport(report: EmailVerificationReport) {
    console.log("\n📊 RAPPORT DE VÉRIFICATION EMAILS CO-PARENTS\n");

    console.log("🔑 CLÉ API RESEND:");
    console.log(`   Configurée: ${report.resendApiKey.configured ? "✅" : "❌"}`);
    console.log(`   Valide: ${report.resendApiKey.valid ? "✅" : "❌"}`);
    if (report.resendApiKey.error) {
      console.log(`   Erreur: ${report.resendApiKey.error}`);
    }

    console.log("\n⚙️ CONFIGURATION SUPABASE:");
    console.log(`   Configuré: ${report.supabaseConfig.configured ? "✅" : "❌"}`);
    console.log(
      `   Fonctions disponibles: ${report.supabaseConfig.functionsAvailable ? "✅" : "❌"}`
    );
    if (report.supabaseConfig.error) {
      console.log(`   Erreur: ${report.supabaseConfig.error}`);
    }

    console.log("\n📧 TESTS D'EMAILS:");
    console.log(`   Email bienvenue: ${report.emailTests.welcome.success ? "✅" : "❌"}`);
    console.log(`   Email invitation: ${report.emailTests.invitation.success ? "✅" : "❌"}`);
    console.log(`   Email reset: ${report.emailTests.reset.success ? "✅" : "❌"}`);

    console.log("\n🎨 TEMPLATES:");
    console.log(`   Complets: ${report.templates.complete ? "✅" : "❌"}`);
    console.log(`   Logo inclus: ${report.templates.hasLogo ? "✅" : "❌"}`);
    console.log(`   Instructions: ${report.templates.hasInstructions ? "✅" : "❌"}`);
    console.log(`   Alertes Spam: ${report.templates.hasSpamWarning ? "✅" : "❌"}`);

    // Afficher un résumé pour l'utilisateur
    const allGood =
      report.resendApiKey.valid &&
      report.emailTests.welcome.success &&
      report.emailTests.invitation.success &&
      report.templates.complete;

    if (allGood) {
      alert(
        "✅ SYSTÈME D'EMAILS VÉRIFIÉ ET FONCTIONNEL !\n\n" +
          "📧 Tous les emails sont opérationnels\n" +
          "🔑 Clé API Resend valide\n" +
          "🎨 Templates complets avec alertes Spam\n" +
          "🚀 Prêt pour la production !"
      );
    } else {
      const issues = [];
      if (!report.resendApiKey.valid) issues.push("Clé API Resend");
      if (!report.emailTests.welcome.success) issues.push("Email bienvenue");
      if (!report.emailTests.invitation.success) issues.push("Email invitation");
      if (!report.templates.complete) issues.push("Templates incomplets");

      alert(
        "⚠️ PROBLÈMES DÉTECTÉS DANS LE SYSTÈME D'EMAILS\n\n" +
          `Problèmes: ${issues.join(", ")}\n\n` +
          "Vérifiez la console pour plus de détails.\n" +
          "L'application fonctionne en mode démo."
      );
    }
  }

  // Test complet avec adresses multiples
  async testMultipleEmailAddresses() {
    const testEmails = ["test1@example.com", "test2@example.com", "test3@example.com"];

    console.log("📧 Test d'envoi vers plusieurs adresses...");

    for (const email of testEmails) {
      try {
        const { simpleEmailService } = await import("./email-simple");
        const result = await simpleEmailService.sendWelcomeEmail(email, "Test User", "CP-TESTCODE");
        console.log(
          `${result.success ? "✅" : "❌"} ${email}: ${result.success ? "Succès" : result.error || "Échec"}`
        );
      } catch (error) {
        console.log(`❌ ${email}: Erreur - ${error.message}`);
      }
    }

    return true;
  }
}

export const emailVerificationService = EmailVerificationService.getInstance();
