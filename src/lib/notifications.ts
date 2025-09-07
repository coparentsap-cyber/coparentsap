import { supabase } from "./supabase";

export interface Notification {
  id: string;
  type: "planning" | "document" | "photo" | "message" | "validation" | "invitation";
  title: string;
  message: string;
  from_user_id: string;
  to_user_id: string;
  data?: any;
  read: boolean;
  created_at: string;
}

class NotificationService {
  private static instance: NotificationService;
  private listeners: ((notification: Notification) => void)[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Demander permission pour notifications push
  async requestPermission(): Promise<boolean> {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }

  // Envoyer notification push
  async sendPushNotification(title: string, message: string, data?: any) {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: message,
        icon: "/icon-192.png",
        badge: "/icon-72.png",
        data: data,
        tag: "co-parents",
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();

        // Naviguer vers la section appropriée
        if (data?.type) {
          this.handleNotificationClick(data.type, data);
        }
      };

      // Auto-fermer après 10 secondes
      setTimeout(() => notification.close(), 10000);
    }
  }

  // Créer notification dans la base
  async createNotification(notification: Omit<Notification, "id" | "created_at" | "read">) {
    try {
      if (!supabase) {
        // Mode démo - simuler la notification
        console.log("🔔 Notification simulée:", notification);

        // Afficher notification push locale
        await this.sendPushNotification(
          notification.title,
          notification.message,
          notification.data
        );

        return {
          id: "demo_" + Date.now(),
          ...notification,
          read: false,
          created_at: new Date().toISOString(),
        };
      }

      const { data, error } = await supabase
        .from("notifications")
        .insert({
          ...notification,
          read: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Envoyer notification push
      await this.sendPushNotification(notification.title, notification.message, notification.data);

      // Notifier les listeners
      this.listeners.forEach((listener) => listener(data));

      return data;
    } catch (error) {
      console.error("Erreur création notification:", error);
      throw error;
    }
  }

  // Marquer comme lue
  async markAsRead(notificationId: string) {
    try {
      if (!supabase) {
        console.log("📖 Notification marquée comme lue (mode démo):", notificationId);
        return;
      }

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
    } catch (error) {
      console.error("Erreur marquage notification:", error);
      throw error;
    }
  }

  // Marquer toutes comme lues
  async markAllAsRead(userId: string) {
    try {
      if (!supabase) {
        console.log("📖 Toutes notifications marquées comme lues (mode démo)");
        return;
      }

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("to_user_id", userId)
        .eq("read", false);

      if (error) throw error;
    } catch (error) {
      console.error("Erreur marquage global:", error);
      throw error;
    }
  }

  // Récupérer notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      if (!supabase) {
        // Mode démo - retourner notifications simulées
        const demoNotifications = [
          {
            id: "1",
            type: "planning" as const,
            title: "Planning mis à jour",
            message: "Votre co-parent a modifié le planning de garde",
            from_user_id: "demo-coparent",
            to_user_id: userId,
            read: false,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "2",
            type: "photo" as const,
            title: "Nouvelle photo",
            message: "Une photo a été ajoutée à la galerie",
            from_user_id: "demo-coparent",
            to_user_id: userId,
            read: true,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        return demoNotifications;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("to_user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erreur récupération notifications:", error);
      return [];
    }
  }

  // Supprimer notification
  async deleteNotification(notificationId: string) {
    try {
      if (!supabase) {
        console.log("🗑️ Notification supprimée (mode démo):", notificationId);
        return;
      }

      const { error } = await supabase.from("notifications").delete().eq("id", notificationId);

      if (error) throw error;
    } catch (error) {
      console.error("Erreur suppression notification:", error);
      throw error;
    }
  }

  // Écouter nouvelles notifications
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    this.listeners.push(callback);

    if (!supabase) {
      // Mode démo - simuler des notifications périodiques
      const interval = setInterval(() => {
        const demoNotification = {
          id: "demo_" + Date.now(),
          type: "message" as const,
          title: "Nouveau message",
          message: "Votre co-parent vous a envoyé un message",
          from_user_id: "demo-coparent",
          to_user_id: userId,
          read: false,
          created_at: new Date().toISOString(),
        };

        if (Math.random() > 0.95) {
          // 5% de chance toutes les secondes
          callback(demoNotification);
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        this.listeners = this.listeners.filter((l) => l !== callback);
      };
    }
    const subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `to_user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          callback(notification);

          // Envoyer notification push
          this.sendPushNotification(notification.title, notification.message, notification.data);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  // Gérer clic sur notification
  private handleNotificationClick(type: string, data: any) {
    switch (type) {
      case "planning":
        window.location.hash = "#planning";
        break;
      case "document":
        window.location.hash = "#documents";
        break;
      case "photo":
        window.location.hash = "#photos";
        break;
      case "message":
        window.location.hash = "#messages";
        break;
      default:
        window.location.hash = "#home";
    }
  }

  // Obtenir statistiques
  async getStats(userId: string) {
    try {
      if (!supabase) {
        return { total: 2, unread: 1, read: 1 };
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("read")
        .eq("to_user_id", userId);

      if (error) throw error;

      const total = data.length;
      const unread = data.filter((n) => !n.read).length;

      return { total, unread, read: total - unread };
    } catch (error) {
      console.error("Erreur stats notifications:", error);
      return { total: 0, unread: 0, read: 0 };
    }
  }
}

export const notificationService = NotificationService.getInstance();
