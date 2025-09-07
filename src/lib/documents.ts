import { supabase } from "./supabase"
import { notificationService } from "./notifications"

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
  enfant?: any
  proprietaire?: any
}

class DocumentsService {
  private static instance: DocumentsService

  static getInstance(): DocumentsService {
    if (!DocumentsService.instance) {
      DocumentsService.instance = new DocumentsService()
    }
    return DocumentsService.instance
  }

  // Uploader un document
  async upload(file: File, titre: string, enfantId?: string, validationRequise: boolean = false) {
    try {
      // Upload du fichier vers Supabase Storage
      const fileName = `${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(fileName)

      // Créer l'enregistrement en base
      const { data: documentData, error: documentError } = await supabase
        .from("documents")
        .insert({
          titre,
          fichier_url: urlData.publicUrl,
          fichier_nom: file.name,
          fichier_taille: file.size,
          fichier_type: file.type,
          enfant_id: enfantId,
          validation_requise: validationRequise,
          statut: validationRequise ? "en_attente" : "valide",
        })
        .select(
          `
          *,
          enfant:enfants(nom),
          proprietaire:users_profiles!proprietaire_id(full_name)
        `
        )
        .single()

      if (documentError) throw documentError

      // Notifier le co-parent
      await this.notifyCoParent(documentData, "ajout")

      return documentData
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Récupérer tous les documents
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select(
          `
          *,
          enfant:enfants(nom),
          proprietaire:users_profiles!proprietaire_id(full_name)
        `
        )
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Valider un document
  async validateDocument(documentId: string, userId: string, approved: boolean) {
    try {
      const { data, error } = await supabase
        .from("documents")
        .update({
          statut: approved ? "valide" : "refuse",
          valide_par: userId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId)
        .select(
          `
          *,
          enfant:enfants(nom),
          proprietaire:users_profiles!proprietaire_id(full_name)
        `
        )
        .single()

      if (error) throw error

      // Notifier le propriétaire
      await this.notifyCoParent(data, approved ? "validation" : "refus")

      return data
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Supprimer un document
  async delete(documentId: string) {
    try {
      // Récupérer les infos du document
      const { data: document } = await supabase
        .from("documents")
        .select("fichier_url, fichier_nom")
        .eq("id", documentId)
        .single()

      if (document) {
        // Supprimer le fichier du storage
        const fileName = document.fichier_url.split("/").pop()
        if (fileName) {
          await supabase.storage.from("documents").remove([fileName])
        }
      }

      // Supprimer l'enregistrement
      const { error } = await supabase.from("documents").delete().eq("id", documentId)

      if (error) throw error

      return true
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Notifier le co-parent
  private async notifyCoParent(document: Document, action: "ajout" | "validation" | "refus") {
    try {
      // Trouver le co-parent
      const { data: connections } = await supabase
        .from("coparent_connections")
        .select("coparent_id")
        .eq("user_id", document.proprietaire_id)
        .eq("status", "connected")

      if (!connections || connections.length === 0) return

      const messages = {
        ajout: {
          title: "Nouveau document ajouté",
          message: `${document.proprietaire?.full_name} a ajouté le document "${document.titre}"`,
        },
        validation: {
          title: "Document validé",
          message: `Votre document "${document.titre}" a été validé`,
        },
        refus: {
          title: "Document refusé",
          message: `Votre document "${document.titre}" a été refusé`,
        },
      }

      for (const connection of connections) {
        await notificationService.createNotification({
          type: "document",
          title: messages[action].title,
          message: messages[action].message,
          from_user_id: document.proprietaire_id,
          to_user_id: connection.coparent_id,
          data: { document_id: document.id },
        })
      }
    } catch (error) {
      console.error("Erreur notification co-parent:", error)
    }
  }

  // Exporter documents en PDF
  async exportToPDF(userId: string) {
    try {
      const documents = await this.getAll()

      // Créer le contenu PDF
      const pdfContent = {
        title: "Documents Co-Parents",
        date: new Date().toLocaleDateString("fr-FR"),
        documents: documents.map((doc) => ({
          titre: doc.titre,
          date: new Date(doc.created_at).toLocaleDateString("fr-FR"),
          enfant: doc.enfant?.nom || "Tous",
          statut: doc.statut,
          taille: this.formatFileSize(doc.fichier_taille),
        })),
      }

      // Appeler la fonction edge pour générer le PDF
      const { data, error } = await supabase.functions.invoke("generate-pdf", {
        body: { type: "documents", content: pdfContent },
      })

      if (error) throw error

      return data.pdf_url
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  private formatFileSize(bytes?: number) {
    if (!bytes) return "Taille inconnue"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }
}

export const documentsService = DocumentsService.getInstance()
