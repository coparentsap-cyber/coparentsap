import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Check, X, Mail, Copy, Users, Clock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const ConnectCoParent: React.FC = () => {
  const { user, profile, connectCoParent } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [sentInvitations, setSentInvitations] = useState<any[]>([]);
  const [connectedCoParents, setConnectedCoParents] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadSentInvitations();
      loadConnectedCoParents();
    }
  }, [user]);

  const loadSentInvitations = async () => {
    if (!user) return;

    try {
      // Charger depuis localStorage en mode démo
      const saved = localStorage.getItem(`invites_${user.id}`);
      if (saved) {
        setSentInvitations(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Erreur chargement invitations:", error);
    }
  };

  const loadConnectedCoParents = async () => {
    if (!user) return;

    try {
      // Charger depuis localStorage en mode démo
      const saved = localStorage.getItem(`connected_coparents_${user.id}`);
      if (saved) {
        setConnectedCoParents(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Erreur chargement co-parents:", error);
    }
  };

  const handleConnect = async () => {
    if (!user || !inviteCode.trim()) return;

    setIsLoading(true);
    try {
      await connectCoParent(inviteCode.trim());

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setInviteCode("");
        loadConnectedCoParents();
      }, 3000);
    } catch (error: any) {
      console.error("Erreur lors de la connexion:", error);
      alert(`❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!user || !profile) return;

    const emailToInvite = inviteEmail.trim();

    if (!emailToInvite) return;

    setIsInviting(true);
    try {
      const inviteCode = profile.invite_code || `CP-${user.id.slice(-8).toUpperCase()}`;

      console.log("📧 ENVOI INVITATION AVEC RETRY...");

      // Utiliser le service de retry pour plus de robustesse
      const { emailRetryService } = await import("../../lib/email-retry-service");
      const result = await emailRetryService.sendEmailWithRetry(
        "invitation",
        emailToInvite,
        profile.full_name || user.email || "Votre co-parent",
        inviteCode
      );

      console.log("📊 RÉSULTAT INVITATION:", result);

      if (result.success) {
        console.log(`✅ INVITATION ENVOYÉE après ${result.attempts} tentative(s)`);

        // Sauvegarder l'invitation en localStorage pour la démo
        const newInvitation = {
          id: Date.now().toString(),
          to_email: emailToInvite,
          from_user_id: user.id,
          invite_code: inviteCode,
          status: "sent",
          sent_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const existingInvites = JSON.parse(localStorage.getItem(`invites_${user.id}`) || "[]");
        const updatedInvites = [...existingInvites, newInvitation];
        localStorage.setItem(`invites_${user.id}`, JSON.stringify(updatedInvites));
        setSentInvitations(updatedInvites);

        setInviteEmail("");

        const successMessage =
          `✅ Invitation envoyée à ${emailToInvite} !\n\n` +
          `📧 Email envoyé après ${result.attempts} tentative(s)\n\n` +
          `⚠️ IMPORTANT : Demandez à votre co-parent de vérifier son dossier SPAM !\n\n` +
          `L'email contient :\n` +
          `• Lien de téléchargement de l'app\n` +
          `• Votre code : ${inviteCode}\n` +
          `• Instructions complètes`;

        alert(successMessage);

        setInviteSuccess(true);
        setTimeout(() => {
          setInviteSuccess(false);
        }, 5000);
      } else {
        console.error(`❌ ÉCHEC INVITATION après ${result.attempts} tentatives:`, result.error);

        // Fallback manuel
        const fallbackMessage =
          `⚠️ Invitation non envoyée automatiquement\n\n` +
          `🔧 Erreur: ${result.error}\n\n` +
          `📱 Partagez manuellement :\n` +
          `• Code: ${inviteCode}\n` +
          `• App: ${window.location.origin}\n\n` +
          `💡 Votre co-parent peut créer son compte puis entrer votre code`;

        alert(fallbackMessage);
      }
    } catch (error: any) {
      console.error("❌ ERREUR CRITIQUE INVITATION:", error);
      alert(`❌ Erreur lors de l'invitation: ${error.message}`);
    } finally {
      setIsInviting(false);
    }
  };

  const copyInviteCode = () => {
    const code = profile?.invite_code || `CP-${user?.id.slice(-8).toUpperCase()}`;
    navigator.clipboard.writeText(code);
    alert("📋 Code copié dans le presse-papier !");
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      // Supprimer l'invitation du localStorage en mode démo
      const updatedInvites = sentInvitations.filter((invite) => invite.id !== invitationId);
      setSentInvitations(updatedInvites);
      localStorage.setItem(`invites_${user?.id}`, JSON.stringify(updatedInvites));
    } catch (error) {
      console.error("Erreur annulation:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mon code d'invitation */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">🔑 Mon code de connexion</h2>
        <div className="bg-white/20 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">Partagez ce code avec votre co-parent :</p>
            <p className="text-2xl font-bold font-mono">
              {profile?.invite_code || `CP-${user?.id.slice(-8).toUpperCase()}`}
            </p>
          </div>
          <button
            onClick={copyInviteCode}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm opacity-90 mt-3">
          💡 Votre co-parent doit créer son compte puis entrer ce code
        </p>
      </div>

      {/* Co-parents connectés */}
      {connectedCoParents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-6 h-6 text-green-600 mr-2" />
            Co-parents connectés
          </h2>
          <div className="space-y-3">
            {connectedCoParents.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{connection.name}</p>
                    <p className="text-sm text-gray-600">{connection.email}</p>
                    <p className="text-xs text-gray-500">
                      Connecté le {new Date(connection.connected_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="text-green-600 font-semibold">✅ Connecté</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inviter par email ou SMS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Mail className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Inviter mon co-parent</h2>
        </div>

        {inviteSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-green-900 mb-2">📧 Invitation envoyée !</h3>
            <p className="text-green-700 text-sm">
              Votre co-parent va recevoir un email avec votre code de connexion et les instructions.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de votre co-parent
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="coparent@email.com"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="bg-red-100 border border-red-300 rounded p-3 mb-3">
                <p className="text-red-800 text-xs font-bold">
                  🚨 VÉRIFIEZ LE DOSSIER SPAM ! 90% des emails y arrivent
                </p>
              </div>
              <div className="bg-orange-100 border border-orange-300 rounded p-2 mb-2">
                <p className="text-orange-800 text-xs font-bold">
                  📁 Vérifiez : Spam + Courriers indésirables + Promotions
                </p>
              </div>
              <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mb-3">
                <p className="text-yellow-800 text-xs font-bold">
                  ✅ Marquez comme "Pas spam" + Ajoutez à vos contacts
                </p>
              </div>
              <h4 className="font-semibold text-blue-900 mb-2">
                📧 Que va recevoir votre co-parent ?
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Email d'invitation personnalisé</li>
                <li>• Lien pour télécharger l'app</li>
                <li>• Votre code de connexion : {profile?.invite_code}</li>
                <li>• Instructions détaillées</li>
              </ul>
            </div>

            <button
              onClick={handleInvite}
              disabled={isInviting || !inviteEmail.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              {isInviting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Envoi...</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Envoyer l'invitation</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Invitations envoyées */}
      {sentInvitations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-yellow-800 text-xs font-bold">
              📧 Rappel : Demandez à vos invités de vérifier leur dossier Spam !
            </p>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-6 h-6 text-yellow-600 mr-2" />
            Invitations envoyées
          </h2>
          <div className="space-y-3">
            {sentInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
              >
                <div>
                  <p className="font-medium text-gray-900">{invitation.to_email}</p>
                  <p className="text-sm text-yellow-700">
                    {invitation.status === "sent"
                      ? "En attente"
                      : invitation.status === "accepted"
                        ? "Acceptée"
                        : invitation.status === "declined"
                          ? "Refusée"
                          : "Expirée"}
                    • Envoyé le {new Date(invitation.sent_at).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="text-xs text-gray-500">
                    Expire le {new Date(invitation.expires_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      invitation.status === "sent"
                        ? "bg-yellow-200 text-yellow-800"
                        : invitation.status === "accepted"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                    }`}
                  >
                    {invitation.status === "sent"
                      ? "⏳ En attente"
                      : invitation.status === "accepted"
                        ? "✅ Acceptée"
                        : invitation.status === "declined"
                          ? "❌ Refusée"
                          : "⏰ Expirée"}
                  </span>
                  {invitation.status === "sent" && (
                    <button
                      onClick={() => cancelInvitation(invitation.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Annuler l'invitation"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Se connecter avec un code */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <UserPlus className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Se connecter avec un code</h2>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-green-900 mb-2">🎉 Connexion réussie !</h3>
            <p className="text-green-700 text-sm">
              Vous êtes maintenant connecté avec votre co-parent. Vous pouvez partager planning,
              messages et photos !
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code de connexion reçu
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-center text-lg"
                placeholder="CP-XXXXXXXX"
                maxLength={11}
              />
              <p className="text-sm text-gray-500 mt-1">
                Format : CP-XXXXXXXX (8 caractères après CP-)
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">📱 Comment obtenir le code ?</h4>
              <p className="text-sm text-purple-700">
                Demandez à votre co-parent de vous inviter via email ou SMS depuis cette section, ou
                demandez-lui son code personnel.
              </p>
            </div>

            <button
              onClick={handleConnect}
              disabled={isLoading || !inviteCode.trim() || inviteCode.length < 11}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Instructions détaillées */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-4">
          💡 Comment connecter votre co-parent
        </h3>
        <div className="space-y-3 text-blue-800">
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 font-bold">1.</span>
            <span>Votre co-parent doit télécharger l'app Co-Parents</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 font-bold">2.</span>
            <span>Il/elle crée son propre compte avec son email</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 font-bold">3.</span>
            <span>
              Dans ses paramètres, il/elle entre votre code :{" "}
              <strong>{profile?.invite_code}</strong>
            </span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 font-bold">4.</span>
            <span>Vous recevez une notification et la connexion est établie</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 font-bold">5.</span>
            <span>Vous pouvez maintenant partager planning, messages et photos !</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectCoParent;
