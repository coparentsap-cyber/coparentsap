import React from "react";
import { motion } from "framer-motion";
import {
  X,
  User,
  Users,
  Settings,
  HelpCircle,
  FileText,
  LogOut,
  CreditCard,
  Heart,
  Clock,
  Bell,
  Shield,
  Mail,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "../UI/Logo";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const { signOut, profile } = useAuth();

  const menuItems = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profil", icon: User },
    { id: "coparents", label: "Co-Parents", icon: Users },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "health", label: "Suivi Santé", icon: Heart },
    { id: "rdv", label: "Rendez-vous", icon: Clock },
    { id: "subscription", label: "Abonnement", icon: CreditCard },
    { id: "settings", label: "Paramètres", icon: Settings },
    { id: "help", label: "Aide/FAQ", icon: HelpCircle },
    { id: "rls-test", label: "Tests RLS", icon: Shield },
    { id: "email-diagnostic", label: "Diagnostic Email", icon: Mail },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 z-[100]" />

      {/* Menu */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        exit={{ x: -300 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-br from-purple-50 via-white to-pink-50 shadow-2xl z-[101] border-r border-purple-100 flex flex-col"
      >
        {/* Header */}
        <div className="relative p-3 border-b border-purple-200 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 flex-shrink-0">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="sm" showText={false} />
              <div>
                <h2 className="text-base font-bold text-white">Co-Parents</h2>
                <p className="text-white/80 text-xs truncate max-w-[120px]">
                  {profile?.full_name || "Utilisateur"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2 px-3">
          <nav className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const colors = [
                "from-blue-500 to-blue-600",
                "from-purple-500 to-purple-600",
                "from-pink-500 to-pink-600",
                "from-green-500 to-green-600",
                "from-orange-500 to-orange-600",
                "from-red-500 to-red-600",
                "from-indigo-500 to-indigo-600",
                "from-teal-500 to-teal-600",
                "from-yellow-500 to-yellow-600",
              ];
              const colorClass = colors[index % colors.length];

              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center space-x-3 p-2.5 text-left hover:bg-white/60 rounded-lg transition-all duration-200 group"
                >
                  <div
                    className={`w-7 h-7 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Footer - Déconnexion */}
        <div className="p-3 border-t border-purple-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-2 text-red-600 hover:text-red-800 font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default SideMenu;
