import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Variables Supabase manquantes - Vérifiez votre configuration .env")
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

// Types pour TypeScript
export interface Enfant {
  id: string
  nom: string
  date_naissance: string
  allergies: string
  medecin: string
  photo_url?: string
  parent_id: string
  created_at: string
  updated_at: string
}

export interface Evenement {
  id: string
  titre: string
  description: string
  date_heure: string
  enfant_id?: string
  parent_createur_id: string
  created_at: string
  updated_at: string
  enfant?: Enfant
}

export interface Message {
  id: string
  texte: string
  date_envoi: string
  expediteur_id: string
  destinataire_id: string
  lu: boolean
  created_at: string
}

export interface Depense {
  id: string
  montant: number
  description: string
  date_depense: string
  payeur_id: string
  enfant_id?: string
  justificatif_url?: string
  created_at: string
  updated_at: string
  enfant?: Enfant
}

export interface Document {
  id: string
  titre: string
  fichier_url: string
  fichier_nom: string
  fichier_taille?: number
  fichier_type?: string
  proprietaire_id: string
  enfant_id?: string
  validation_requise: boolean
  valide_par?: string
  statut: "en_attente" | "valide" | "refuse"
  created_at: string
  updated_at: string
  enfant?: Enfant
  proprietaire?: any
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
  created_at: string
  updated_at: string
  enfants?: EnfantLegacy[]
}

export interface EnfantLegacy {
  id: string
  nom: string
  prenom: string
  date_naissance: string
  photo_url?: string
  ecole: {
    nom: string
    adresse: string
    telephone: string
  }
  medecin: {
    nom: string
    adresse: string
    telephone: string
  }
  allergies: string[]
  groupe_sanguin: string
  numero_secu: string
  activites: {
    nom: string
    jour: string
    heure: string
    adresse: string
    telephone?: string
  }[]
  urgences: {
    nom: string
    telephone: string
    relation: string
  }[]
}

export interface Photo {
  id: string
  user_id: string
  url: string
  description?: string
  date_upload: string
  enfant?: string
}

// Services pour les nouvelles collections
export const enfantsService = {
  async getAll() {
    if (!supabase) throw new Error("Supabase non configuré")

    const { data, error } = await supabase
      .from("enfants")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(enfant: Omit<Enfant, "id" | "created_at" | "updated_at">) {
    if (!supabase) throw new Error("Supabase non configuré")

    const { data, error } = await supabase.from("enfants").insert(enfant).select().single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Enfant>) {
    if (!supabase) throw new Error("Supabase non configuré")

    const { data, error } = await supabase
      .from("enfants")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    if (!supabase) throw new Error("Supabase non configuré")

    const { error } = await supabase.from("enfants").delete().eq("id", id)

    if (error) throw error
  },
}

export const messagesService = {
  async getConversation(otherUserId: string) {
    if (!supabase) throw new Error("Supabase non configuré")

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(expediteur_id.eq.${supabase.auth.getUser().then((u) => u.data.user?.id)},destinataire_id.eq.${otherUserId}),and(expediteur_id.eq.${otherUserId},destinataire_id.eq.${supabase.auth.getUser().then((u) => u.data.user?.id)})`
      )
      .order("date_envoi", { ascending: true })

    if (error) throw error
    return data || []
  },

  async send(destinataireId: string, texte: string) {
    if (!supabase) throw new Error("Supabase non configuré")

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error("Utilisateur non connecté")

    const { data, error } = await supabase
      .from("messages")
      .insert({
        texte,
        expediteur_id: user.user.id,
        destinataire_id: destinataireId,
        lu: false,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async markAsRead(messageId: string) {
    if (!supabase) throw new Error("Supabase non configuré")

    const { error } = await supabase.from("messages").update({ lu: true }).eq("id", messageId)

    if (error) throw error
  },
}

export const depensesService = {
  async getAll() {
    if (!supabase) throw new Error("Supabase non configuré")

    const { data, error } = await supabase
      .from("depenses")
      .select(
        `
        *,
        enfant:enfants(nom)
      `
      )
      .order("date_depense", { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(depense: Omit<Depense, "id" | "created_at" | "updated_at">) {
    if (!supabase) throw new Error("Supabase non configuré")

    const { data, error } = await supabase
      .from("depenses")
      .insert(depense)
      .select(
        `
        *,
        enfant:enfants(nom)
      `
      )
      .single()

    if (error) throw error
    return data
  },
}

export const photosService = {
  async getAll() {
    if (!supabase) throw new Error("Supabase non configuré")

    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .order("date_upload", { ascending: false })

    if (error) throw error
    return data || []
  },

  async upload(file: File, description?: string, enfant?: string) {
    if (!supabase) throw new Error("Supabase non configuré")

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error("Utilisateur non connecté")

    // Upload du fichier
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.user.id}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage.from("photos").getPublicUrl(fileName)

    // Créer l'enregistrement
    const { data: photoData, error: photoError } = await supabase
      .from("photos")
      .insert({
        user_id: user.user.id,
        url: urlData.publicUrl,
        description: description || `Photo ajoutée le ${new Date().toLocaleDateString("fr-FR")}`,
        enfant: enfant,
        date_upload: new Date().toISOString(),
      })
      .select()
      .single()

    if (photoError) throw photoError
    return photoData
  },

  async delete(photoId: string) {
    if (!supabase) throw new Error("Supabase non configuré")

    // Récupérer les infos de la photo
    const { data: photo } = await supabase
      .from("photos")
      .select("url, user_id")
      .eq("id", photoId)
      .single()

    if (photo) {
      // Supprimer le fichier du storage
      const fileName = photo.url.split("/").pop()
      if (fileName) {
        await supabase.storage.from("photos").remove([`${photo.user_id}/${fileName}`])
      }
    }

    // Supprimer l'enregistrement
    const { error } = await supabase.from("photos").delete().eq("id", photoId)

    if (error) throw error
  },
}
