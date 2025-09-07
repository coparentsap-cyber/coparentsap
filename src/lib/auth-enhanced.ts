// Service d'authentification renforcé avec gestion RLS
import { supabase } from "./supabase"
import { simpleEmailService } from "./email-simple"
import { emailRetryService } from "./email-retry-service"

export interface AuthUser {
  id: string
  email: string
  phone?: string
  email_confirmed: boolean
  phone_confirmed: boolean
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  phone?: string
  invite_code: string
  photo_url?: string
  subscription_status: "trialing" | "active" | "inactive" | "canceled"
  is_trial: boolean
  trial_end_date?: string
  email_confirmed: boolean
  phone_confirmed: boolean
  stripe_customer_id?: string
  created_at: string
  updated_at: string
  enfants?: any[]
}

class EnhancedAuthService {
  private static instance: EnhancedAuthService

  static getInstance(): EnhancedAuthService {
    if (!EnhancedAuthService.instance) {
      EnhancedAuthService.instance = new EnhancedAuthService()
    }
    return EnhancedAuthService.instance
  }

  // Inscription avec gestion RLS renforcée
  async signUp(email: string, password: string, fullName: string) {
    try {
      console.log("🔧 DÉBUT INSCRIPTION AVEC RLS CORRIGÉ:", { email, fullName })

      if (!supabase) {
        throw new Error('Veuillez configurer Supabase en cliquant sur "Connect to Supabase"')
      }

      // Vérifier d'abord la configuration email
      console.log("📧 VÉRIFICATION CONFIGURATION EMAIL...")
      const emailConfig = await this.verifyEmailConfiguration()
      console.log("📊 Configuration email:", emailConfig)

      // Étape 1: Créer le compte Supabase Auth
      console.log("👤 Création compte Supabase Auth...")
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        console.error("❌ Erreur Supabase Auth:", authError)

        // Gestion spécifique des erreurs d'email
        if (authError.message.includes("confirmation email")) {
          console.warn("⚠️ Erreur envoi email de confirmation - Continuons sans confirmation")
          // Ne pas bloquer l'inscription, continuer sans confirmation
        } else {
          throw authError
        }
      }

      if (!authData.user) {
        throw new Error("Aucun utilisateur créé par Supabase Auth")
      }

      console.log("✅ Compte Supabase Auth créé:", authData.user.id)

      // Étape 2: Générer code unique
      const inviteCode = `CP-${authData.user.id.slice(-8).toUpperCase()}`
      console.log("🔑 Code généré:", inviteCode)

      // Étape 3: Créer profil avec les données directes de l'inscription
      console.log("📝 Création profil utilisateur avec données directes...")

      const profileData = {
        user_id: authData.user.id,
        full_name: fullName,
        email: email,
        invite_code: inviteCode,
        is_trial: true,
        trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: "trialing" as const,
        email_confirmed: !authData.user.email_confirmed_at ? false : true,
        phone_confirmed: false,
      }

      console.log("📋 Données profil à insérer:", profileData)

      // Insertion directe avec la nouvelle policy RLS
      console.log("📝 Insertion profil avec policies RLS corrigées...")

      const { data: newProfile, error: profileError } = await supabase
        .from("users_profiles")
        .insert(profileData)
        .select()
        .single()

      if (profileError) {
        console.error("❌ ERREUR RLS CRÉATION PROFIL:", {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
          userId: authData.user.id,
          authUid: authData.user.id,
        })

        // Diagnostic automatique en cas d'erreur RLS
        if (profileError.message.includes("row-level security")) {
          console.log("🔍 DIAGNOSTIC RLS AUTOMATIQUE...")
          await this.diagnosePolicyIssues()
        }

        throw new Error(`Erreur RLS: ${profileError.message}`)
      }

      console.log("✅ Profil créé avec succès:", newProfile)

      // Étape 4: Envoyer email de bienvenue
      console.log("📧 ENVOI EMAIL BIENVENUE...")

      try {
        // Utiliser le service complet avec vérifications
        const { comprehensiveEmailService } = await import("./email-comprehensive-service")

        // Vérifier d'abord la configuration
        const configReport = await comprehensiveEmailService.runFullEmailDiagnostic()

        if (configReport.overallStatus === "success") {
          console.log("✅ Configuration email validée - Envoi en cours...")
          const emailResult = await simpleEmailService.sendWelcomeEmail(email, fullName, inviteCode)

          console.log("📊 RÉSULTAT EMAIL:", emailResult)

          if (emailResult && emailResult.success) {
            console.log("✅ EMAIL ENVOYÉ avec succès")
          } else {
            console.warn("⚠️ EMAIL ÉCHOUÉ:", emailResult?.error || "Erreur inconnue")
          }
        } else {
          console.warn("⚠️ Configuration email non optimale - Mode démo activé")

          // Afficher message informatif
          const fallbackMessage =
            `✅ Compte créé avec succès !\n\n` +
            `⚠️ Email de confirmation non envoyé automatiquement\n` +
            `📧 Cause: Configuration email à optimiser\n\n` +
            `🔑 Votre code unique : ${inviteCode}\n` +
            `👥 Vous pouvez quand même inviter votre co-parent !\n\n` +
            `🚨 IMPORTANT : Si vous recevez un email plus tard,\n` +
            `📧 VÉRIFIEZ VOTRE DOSSIER SPAM !`

          console.warn("📧 Email bienvenue (mode fallback):", fallbackMessage)
        }
      } catch (emailError) {
        console.error("❌ ERREUR EMAIL (non bloquante):", emailError)
        // Ne pas bloquer l'inscription pour un problème d'email
      }

      return {
        user: authData.user,
        profile: newProfile,
        session: authData.session,
        needsEmailConfirmation: !authData.session, // Si pas de session, confirmation requise
      }
    } catch (error: any) {
      console.error("❌ ERREUR CRITIQUE INSCRIPTION:", error)
      console.error("📊 Stack trace complète:", error.stack)

      // Diagnostic automatique en cas d'erreur
      if (error.message.includes("row-level security")) {
        console.log("🔍 DIAGNOSTIC RLS AUTOMATIQUE...")
        await this.diagnosePolicyIssues()
      }

      throw new Error(error.message)
    }
  }

  // Vérifier la configuration email
  private async verifyEmailConfiguration() {
    try {
      if (!supabase) {
        return { configured: false, error: "Supabase non configuré" }
      }

      const { data, error } = await supabase.rpc("test_email_configuration")

      if (error) {
        console.warn("⚠️ Impossible de vérifier config email:", error)
        return { configured: false, error: error.message }
      }

      return {
        configured: data?.resend_api_key_configured || false,
        fromEmailConfigured: data?.from_email_configured || false,
        timestamp: data?.timestamp,
      }
    } catch (error: any) {
      console.warn("⚠️ Erreur vérification config email:", error)
      return { configured: false, error: error.message }
    }
  }

  // Diagnostic automatique des problèmes de policies
  private async diagnosePolicyIssues() {
    try {
      console.log("🔍 DIAGNOSTIC POLICIES RLS...")

      // Utiliser la nouvelle fonction de vérification
      const { data: rlsStatus, error: rlsError } = await supabase.rpc("verify_rls_policies", {
        table_name: "users_profiles",
      })

      if (rlsError) {
        console.error("❌ Erreur vérification RLS:", rlsError)
        return
      }

      console.log("📊 Statut RLS users_profiles:", rlsStatus)

      // Vérifier aussi les invitations
      const { data: invitationsRLS } = await supabase.rpc("verify_rls_policies", {
        table_name: "invitations",
      })

      console.log("📊 Statut RLS invitations:", invitationsRLS)

      // Vérifier l'utilisateur connecté
      const { data: currentUser } = await supabase.auth.getUser()
      console.log("👤 Utilisateur connecté:", {
        id: currentUser.user?.id,
        email: currentUser.user?.email,
        aud: currentUser.user?.aud,
        role: currentUser.user?.role,
      })
    } catch (error) {
      console.error("❌ Erreur diagnostic policies:", error)
    }
  }

  // Test d'insertion avec logs détaillés
  async testProfileInsertion(userId: string, profileData: any) {
    try {
      console.log("🧪 TEST INSERTION PROFIL:", { userId, profileData })

      // Vérifier l'utilisateur connecté
      const { data: currentUser } = await supabase.auth.getUser()
      console.log("👤 Utilisateur pour test:", {
        connected: !!currentUser.user,
        id: currentUser.user?.id,
        matches: currentUser.user?.id === userId,
      })

      if (!currentUser.user) {
        throw new Error("Aucun utilisateur connecté pour test")
      }

      if (currentUser.user.id !== userId) {
        throw new Error(`ID utilisateur ne correspond pas: ${currentUser.user.id} vs ${userId}`)
      }

      // Tentative d'insertion
      const { data, error } = await supabase
        .from("users_profiles")
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error("❌ Erreur insertion test:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        throw error
      }

      console.log("✅ Test insertion réussi:", data)
      return data
    } catch (error: any) {
      console.error("❌ Échec test insertion:", error)
      throw error
    }
  }

  // Connexion standard
  async signIn(email: string, password: string) {
    try {
      if (!supabase) {
        throw new Error('Veuillez configurer Supabase en cliquant sur "Connect to Supabase"')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return data
    } catch (error: any) {
      console.error("Erreur connexion:", error)
      throw new Error(error.message)
    }
  }

  // Déconnexion
  async signOut() {
    try {
      if (!supabase) {
        localStorage.clear()
        return
      }

      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      console.error("Erreur déconnexion:", error)
      throw new Error(error.message)
    }
  }
}

export const enhancedAuthService = EnhancedAuthService.getInstance()
