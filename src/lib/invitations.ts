import { supabase } from "./supabase"
import { emailService } from "./email"

export interface Invitation {
  id: string
  from_user_id: string
  to_email: string
  invite_code: string
  token: string
  status: "sent" | "accepted" | "declined" | "expired"
  sent_at: string
  accepted_at?: string
  expires_at: string
  created_at: string
}

class InvitationService {
  private static instance: InvitationService

  static getInstance(): InvitationService {
    if (!InvitationService.instance) {
      InvitationService.instance = new InvitationService()
    }
    return InvitationService.instance
  }

  // Envoyer une invitation par email
  async sendInvitation(toEmail: string, fromUserName: string) {
    try {
      if (!supabase) {
        // Mode démo - simuler l'envoi
        console.log("📧 Invitation simulée envoyée à:", toEmail)

        // Simuler l'email d'invitation
        const inviteCode = `CP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`

        alert(
          `📧 Invitation envoyée à ${toEmail} !\n\n` +
            `Email envoyé avec :\n` +
            `• Lien téléchargement : ${window.location.origin}\n` +
            `• Code de connexion : ${inviteCode}\n` +
            `• Instructions complètes\n\n` +
            `Votre co-parent peut maintenant s'inscrire et utiliser ce code !`
        )

        return { success: true, invite_code: inviteCode }
      }

      // Vérifier que l'email n'est pas déjà utilisé
      const { data: existingUser } = await supabase
        .from("users_profiles")
        .select("email")
        .eq("email", toEmail)
        .single()

      if (existingUser) {
        throw new Error(
          "Cet email est déjà inscrit. Demandez-lui d'utiliser votre code directement."
        )
      }

      const inviteCode = `CP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`

      // Créer l'invitation en base
      const { data: invitation, error } = await supabase
        .from("invitations")
        .insert({
          to_email: toEmail,
          invite_code: inviteCode,
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error

      // Envoyer l'email d'invitation
      await emailService.sendInviteEmail(toEmail, fromUserName, inviteCode)

      return invitation
    } catch (error: any) {
      console.error("Erreur envoi invitation:", error)
      throw new Error(error.message)
    }
  }

  // Valider une invitation par token
  async validateInvitationToken(token: string) {
    try {
      if (!supabase) {
        throw new Error('Veuillez configurer Supabase en cliquant sur "Connect to Supabase"')
      }

      // Utiliser invite_code au lieu de token
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("invite_code", token)
        .eq("status", "sent")
        .single()

      if (error || !data) {
        throw new Error("Invitation invalide")
      }

      return { valid: true, invitation: data }
    } catch (error: any) {
      console.error("Erreur validation token:", error)
      throw new Error(error.message)
    }
  }

  // Valider un code d'invitation
  async validateInviteCode(inviteCode: string) {
    try {
      if (!supabase) {
        throw new Error('Veuillez configurer Supabase en cliquant sur "Connect to Supabase"')
      }

      const { data: profile, error } = await supabase
        .from("users_profiles")
        .select("user_id, full_name, invite_code")
        .eq("invite_code", inviteCode)
        .single()

      if (error || !profile) {
        throw new Error("Code d'invitation invalide")
      }

      return { valid: true, profile: profile }
    } catch (error: any) {
      console.error("Erreur validation code:", error)
      throw new Error(error.message)
    }
  }

  // Accepter une invitation
  async acceptInvitation(inviteCode: string, newUserId: string) {
    try {
      if (!supabase) {
        throw new Error('Veuillez configurer Supabase en cliquant sur "Connect to Supabase"')
      }

      // Récupérer l'invitation
      const { data: invitation, error: inviteError } = await supabase
        .from("invitations")
        .select("*")
        .eq("invite_code", inviteCode)
        .eq("status", "sent")
        .single()

      if (inviteError || !invitation) {
        throw new Error("Invitation invalide")
      }

      // Marquer l'invitation comme acceptée
      const { error: updateError } = await supabase
        .from("invitations")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", invitation.id)

      if (updateError) throw updateError

      // Créer la connexion bidirectionnelle
      const { error: connectionError } = await supabase.from("coparent_connections").insert([
        {
          user_id: invitation.from_user_id,
          coparent_id: newUserId,
          status: "connected",
        },
        {
          user_id: newUserId,
          coparent_id: invitation.from_user_id,
          status: "connected",
        },
      ])

      if (connectionError) throw connectionError

      return { success: true, invitation }
    } catch (error: any) {
      console.error("Erreur acceptation invitation:", error)
      throw new Error(error.message)
    }
  }

  // Récupérer les invitations envoyées
  async getSentInvitations(userId: string) {
    try {
      if (!supabase) {
        throw new Error('Veuillez configurer Supabase en cliquant sur "Connect to Supabase"')
      }

      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("from_user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error("Erreur récupération invitations:", error)
      return []
    }
  }

  // Annuler une invitation
  async cancelInvitation(invitationId: string) {
    try {
      if (!supabase) {
        throw new Error('Veuillez configurer Supabase en cliquant sur "Connect to Supabase"')
      }

      const { error } = await supabase
        .from("invitations")
        .update({ status: "declined" })
        .eq("id", invitationId)

      if (error) throw error
    } catch (error: any) {
      console.error("Erreur annulation invitation:", error)
      throw new Error(error.message)
    }
  }
}

export const invitationService = InvitationService.getInstance()
