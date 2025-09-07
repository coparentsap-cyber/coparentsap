import { loadStripe } from "@stripe/stripe-js";

// Clé publique Stripe (à remplacer par votre vraie clé)
const stripePromise = loadStripe(
  "pk_live_51RuZvV3WPtnvw5tUOpvvQspzRfmJY2uXCP2NIPLcqvnV289fXRdd3lpHPcmnSdA6mdVMao2IaYDK0QzVsKjF3x3W00XiAkUir4"
);

export { stripePromise };

// Types pour les abonnements
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  trialDays: number;
  features: string[];
}

export const plans: SubscriptionPlan[] = [
  {
    id: "co_parents_monthly",
    name: "Co-Parents Mensuel",
    price: 999, // 9,99€ en centimes
    currency: "eur",
    interval: "month",
    trialDays: 30,
    features: [
      "Planning de garde illimité",
      "Messages instantanés",
      "Partage de photos",
      "Contacts d'urgence",
      "Support prioritaire",
      "Synchronisation temps réel",
    ],
  },
];

// Fonction pour créer une session de paiement
export const createCheckoutSession = async (planId: string, userId: string) => {
  try {
    // Mode démo - simulation d'une session Stripe
    console.log("Création session Stripe pour:", { planId, userId });

    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Retourner un ID de session simulé
    return "cs_test_demo_" + Date.now();
  } catch (error) {
    console.error("Erreur Stripe:", error);
    throw error;
  }
};

// Fonction pour rediriger vers Stripe Checkout
export const redirectToCheckout = async (sessionId: string) => {
  // Mode démo - simuler la redirection Stripe
  console.log("Redirection vers Stripe Checkout:", sessionId);

  // Simuler le processus de paiement
  const confirmPayment = confirm(
    "🎯 MODE DÉMO STRIPE\n\n" +
      "✅ Abonnement: Co-Parents Mensuel\n" +
      "💰 Prix: 9,99€/mois\n" +
      "🎁 Essai gratuit: 7 jours\n\n" +
      "Voulez-vous simuler un paiement réussi ?"
  );

  if (confirmPayment) {
    // Simuler un paiement réussi
    alert("🎉 Paiement simulé avec succès !\n\nVotre essai gratuit de 1 mois commence maintenant.");

    // Mettre à jour le statut d'abonnement en local
    const storedProfile = localStorage.getItem("demo_profile");
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      profile.subscription_status = "active";
      profile.is_trial = true;
      profile.trial_end_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem("demo_profile", JSON.stringify(profile));
    }

    // Recharger la page pour mettre à jour l'interface
    window.location.reload();
  } else {
    throw new Error("Paiement annulé par l'utilisateur");
  }
};

// Fonction pour créer un portail client (gestion abonnement)
export const createCustomerPortal = async (customerId: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-customer-portal`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          customerId,
          returnUrl: window.location.origin,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la création du portail client");
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error("Erreur portail client:", error);
    throw error;
  }
};
