import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, X, Copy, UserPlus, MessageCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface CoParentInvite {
  id: string;
  email: string;
  status: "pending" | "accepted" | "declined";
  sent_at: string;
  accepted_at?: string;
}

interface ConnectedCoParent {
  id: string;
  name: string;
  email: string;
  connected_at: string;
  last_seen?: string;
}

const CoParentConnection: React.FC = () => {
  const { user, profile } = useAuth();
  const [connectedCoParents, setConnectedCoParents] = useState<ConnectedCoParent[]>([]);
  const [pendingInvites, setPendingInvites] = useState<CoParentInvite[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [myInviteCode, setMyInviteCode] = useState("");

  useEffect(() => {
    loadConnections();
    generateMyInviteCode();
  }, [user]);

  const loadConnections = () => {
    if (!user) return;

    try {
      // Charger les co-parents connectés
      const savedConnections = localStorage.getItem(`coparents_${user.id}`);
      if (savedConnections) {
        setConnectedCoParents(JSON.parse(savedConnections));
      }

      // Charger les invitations en attente
      const savedInvites = localStorage.getItem(`invites_${user.id}`);
      if (savedInvites) {
        setPendingInvites(JSON.parse(savedInvites));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des connexions:", error);
    }
  };

  const generateMyInviteCode = () => {
    if (!user) return;

    // Générer un code unique basé sur l'ID utilisateur
    const code = `CP-${user.id.slice(-8).toUpperCase()}`;
    setMyInviteCode(code);
  };

  const sendInvite = async () => {
    if (!user || !inviteEmail.trim()) return;

    setIsLoading(true);
    try {
      // Simuler l'envoi d'invitation
      const newInvite: CoParentInvite = {
        id: Date.now().toString(),
        email: inviteEmail.trim(),
        status: "pending",
        sent_at: new Date().toISOString(),
      };

      const updatedInvites = [...pendingInvites, newInvite];
      localStorage.setItem(`invites_${user.id}`, JSON.stringify(updatedInvites));
      setPendingInvites(updatedInvites);

      // Simuler l'envoi d'email
      alert(
        `📧 Invitation envoyée à ${inviteEmail} !\n\n` +
          `Votre co-parent recevra un email avec :\n` +
          `• Lien pour télécharger l'app\n` +
          `• Votre code de connexion : ${myInviteCode}\n` +
          `• Instructions pour se connecter`
      );

      setInviteEmail("");
      setShowInviteForm(false);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvite = (inviteCode: string) => {
    // Simuler l'acceptation d'une invitation
    const newConnection: ConnectedCoParent = {
      id: "coparent-" + Date.now(),
      name: "Co-Parent",
      email: "coparent@example.com",
      connected_at: new Date().toISOString(),
    };

    const updatedConnections = [...connectedCoParents, newConnection];
    localStorage.setItem(`coparents_${user?.id}`, JSON.stringify(updatedConnections));
    setConnectedCoParents(updatedConnections);

    alert("🎉 Co-parent connecté avec succès !");
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(myInviteCode);
    alert("📋 Code copié ! Partagez-le avec votre co-parent.");
  };

  const disconnectCoParent = (id: string) => {
    if (!confirm("Déconnecter ce co-parent ?")) return;

    const updatedConnections = connectedCoParents.filter((cp) => cp.id !== id);
    localStorage.setItem(`coparents_${user?.id}`, JSON.stringify(updatedConnections));
    setConnectedCoParents(updatedConnections);
  };

  return (
    <div className="p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Connexion Co-Parents</h1>
            <p className="text-gray-600">Connectez-vous avec votre co-parent</p>
          </div>
        </div>

        {/* Mon code d'invitation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white mb-6"
        >
          <h2 className="text-xl font-bold mb-4">🔗 Mon code de connexion</h2>
          <div className="bg-white/20 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Partagez ce code avec votre co-parent :</p>
              <p className="text-2xl font-bold font-mono">{myInviteCode}</p>
            </div>
            <button
              onClick={copyInviteCode}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm opacity-90 mt-3">
            💡 Votre co-parent doit créer son compte puis entrer ce code pour vous connecter
          </p>
        </motion.div>

        {/* Co-parents connectés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Co-parents connectés</h2>
              <button
                onClick={() => setShowInviteForm(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                <span>Inviter</span>
              </button>
            </div>

            {connectedCoParents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">Aucun co-parent connecté</p>
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Inviter mon co-parent
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {connectedCoParents.map((coparent) => (
                  <div
                    key={coparent.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{coparent.name}</p>
                        <p className="text-sm text-gray-600">{coparent.email}</p>
                        <p className="text-xs text-gray-500">
                          Connecté le {new Date(coparent.connected_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          /* Ouvrir messages */
                        }}
                        className="text-blue-500 hover:text-blue-700 p-2"
                        title="Envoyer un message"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => disconnectCoParent(coparent.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Déconnecter"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Invitations en attente */}
        {pendingInvites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Invitations envoyées</h2>
              <div className="space-y-3">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{invite.email}</p>
                      <p className="text-sm text-yellow-700">
                        En attente • Envoyé le{" "}
                        {new Date(invite.sent_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm">
                      ⏳ En attente
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 rounded-xl p-6 border border-blue-200"
        >
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
                Dans ses paramètres, il/elle entre votre code : <strong>{myInviteCode}</strong>
              </span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 font-bold">4.</span>
              <span>Vous recevez une notification et pouvez accepter la connexion</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 font-bold">5.</span>
              <span>Vous pouvez maintenant partager planning, messages et photos !</span>
            </div>
          </div>
        </motion.div>

        {/* Modal d'invitation */}
        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Inviter mon co-parent</h3>
                  <button
                    onClick={() => setShowInviteForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de votre co-parent
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="coparent@email.com"
                      required
                    />
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">
                      📧 Que va recevoir votre co-parent ?
                    </h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Email d'invitation personnalisé</li>
                      <li>• Lien pour télécharger l'app</li>
                      <li>
                        • Votre code de connexion : <strong>{myInviteCode}</strong>
                      </li>
                      <li>• Instructions pour se connecter</li>
                    </ul>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={sendInvite}
                      disabled={isLoading || !inviteEmail.trim()}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium"
                    >
                      {isLoading ? "📤 Envoi..." : "📧 Envoyer l'invitation"}
                    </button>
                    <button
                      onClick={() => setShowInviteForm(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium"
                    >
                      ❌ Annuler
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CoParentConnection;
