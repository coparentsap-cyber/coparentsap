import { supabase } from "./supabase";
import { simpleEmailService } from "./email-simple";
import { notificationService } from "./notifications";

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  email_confirmed: boolean;
  phone_confirmed: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  invite_code: string;
  photo_url?: string;
  subscription_status: "trialing" | "active" | "inactive" | "canceled";
  is_trial: boolean;
  trial_end_date?: string;
  email_confirmed: boolean;
  phone_confirmed: boolean;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
  enfants?: any[];
}

class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {}
  // Connexion
  async signIn(email: string, password: string) {
    try {
      if (!supabase) {
        throw new Error('Veuillez configurer Supabase en cliquant sur "Connect to Supabase"');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Erreur connexion:", error);
      throw new Error(error.message);
    }
  }

  // Réinitialisation mot de passe
  async resetPassword(email: string) {
    try {
      if (!supabase) {
        throw new Error("Supabase non configuré");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      // Envoyer email personnalisé
      try {
        await simpleEmailService.sendPasswordResetEmail(email);
      } catch (emailError) {
        console.warn("Email de reset personnalisé non envoyé:", emailError);
      }
    } catch (error: any) {
      console.error("Erreur reset password:", error);
      throw new Error(error.message);
    }
  }

  // Connecter co-parent avec code
  async connectCoParent(inviteCode: string, currentUserId: string) {
    try {
      if (!supabase)
        throw new Error('Veuillez configurer Supabase en cliquant sur "Connect to Supabase"');

      // Trouver le profil avec ce code directement
      const { data: targetProfile, error } = await supabase
        .from("users_profiles")
        .select("*")
        .eq("invite_code", inviteCode)
        .single();

      if (error || !targetProfile) {
        throw new Error("Code d'invitation invalide");
      }

      if (targetProfile.user_id === currentUserId) {
        throw new Error("Vous ne pouvez pas vous connecter à vous-même");
      }

      // Vérifier si déjà connectés
      const { data: existingConnection } = await supabase
        .from("coparent_connections")
        .select("*")
        .eq("user_id", currentUserId)
        .eq("coparent_id", targetProfile.user_id)
        .single();

      if (existingConnection) {
        throw new Error("Vous êtes déjà connectés avec ce co-parent");
      }

      // Créer la connexion bidirectionnelle
      const { error: connectionError } = await supabase.from("coparent_connections").insert([
        {
          user_id: currentUserId,
          coparent_id: targetProfile.user_id,
          status: "connected",
        },
        {
          user_id: targetProfile.user_id,
          coparent_id: currentUserId,
          status: "connected",
        },
      ]);

      if (connectionError) throw connectionError;

      // Notifier l'utilisateur qui a le code
      await notificationService.createNotification({
        type: "invitation",
        title: "Nouveau co-parent connecté",
        message: `Un co-parent s'est connecté à votre compte`,
        from_user_id: currentUserId,
        to_user_id: targetProfile.user_id,
      });

      return targetProfile;
    } catch (error: any) {
      console.error("Erreur connexion co-parent:", error);
      throw new Error(error.message);
    }
  }

  // Connecter co-parent avec code (version alternative)
  async connectCoParentAlt(inviteCode: string, currentUserId: string) {
    try {
      if (!supabase)
        throw new Error('Veuillez configurer Supabase en cliquant sur "Connect to Supabase"');

      // Trouver le profil avec ce code
      const { data: targetProfile, error } = await supabase
        .from("users_profiles")
        .select("*")
        .eq("invite_code", inviteCode)
        .single();

      if (error || !targetProfile) {
        throw new Error("Code d'invitation invalide");
      }

      if (targetProfile.user_id === currentUserId) {
        throw new Error("Vous ne pouvez pas vous connecter à vous-même");
      }

      // Vérifier si déjà connectés
      const { data: existingConnection } = await supabase
        .from("coparent_connections")
        .select("*")
        .eq("user_id", currentUserId)
        .eq("coparent_id", targetProfile.user_id)
        .single();

      if (existingConnection) {
        throw new Error("Vous êtes déjà connectés");
      }

      // Créer la connexion bidirectionnelle
      const { error: connectionError } = await supabase.from("coparent_connections").insert([
        {
          user_id: currentUserId,
          coparent_id: targetProfile.user_id,
          status: "connected",
          connected_at: new Date().toISOString(),
        },
        {
          user_id: targetProfile.user_id,
          coparent_id: currentUserId,
          status: "connected",
          connected_at: new Date().toISOString(),
        },
      ]);

      if (connectionError) throw connectionError;

      // Notification
      await notificationService.createNotification({
        type: "invitation",
        title: "Nouveau co-parent connecté",
        message: `Un co-parent s'est connecté à votre compte`,
        from_user_id: currentUserId,
        to_user_id: targetProfile.user_id,
      });

      return targetProfile;
    } catch (error: any) {
      console.error("Erreur connexion co-parent:", error);
      throw new Error(error.message);
    }
  }

  // Inviter co-parent par email
  async inviteCoParent(
    email: string,
    currentUserId: string,
    currentUserName: string,
    inviteCode: string
  ) {
    try {
      if (!supabase) {
        throw new Error("Supabase non configuré");
      }

      // Vérifier que l'email n'est pas déjà utilisé
      const { data: existingUser } = await supabase
        .from("users_profiles")
        .select("email")
        .eq("email", email)
        .single();

      if (existingUser) {
        throw new Error(
          "Cet email est déjà inscrit. Demandez-lui d'utiliser votre code directement."
        );
      }

      // Enregistrer l'invitation
      const { error: inviteError } = await supabase.from("invitations").insert({
        from_user_id: currentUserId,
        to_email: email,
        invite_code: inviteCode,
        status: "sent",
        sent_at: new Date().toISOString(),
      });

      if (inviteError) throw inviteError;

      // Envoyer email d'invitation
      await simpleEmailService.sendInviteEmail(email, currentUserName, inviteCode);

      return true;
    } catch (error: any) {
      console.error("Erreur invitation:", error);
      throw new Error(error.message);
    }
  }

  // Confirmer email
  async confirmEmail(userId: string) {
    try {
      if (!supabase) {
        throw new Error("Supabase non configuré");
      }

      const { error } = await supabase
        .from("users_profiles")
        .update({
          email_confirmed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error: any) {
      console.error("Erreur confirmation email:", error);
      throw new Error(error.message);
    }
  }

  // Déconnexion
  async signOut() {
    try {
      if (!supabase) {
        // Mode développement - nettoyer localStorage
        localStorage.clear();
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error("Erreur déconnexion:", error);
      throw new Error(error.message);
    }
  }
}

export const authService = AuthService.getInstance();
