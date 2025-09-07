import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: () => void
}

export default function SideMenu({ isOpen, onClose, onNavigate }: SideMenuProps) {
  const { pathname } = useLocation()

  const links = [
    { to: "/", label: "Accueil", icon: "🏠" },
    { to: "/messages", label: "Messages", icon: "💬" },
    { to: "/planning", label: "Planning", icon: "📅" },
    { to: "/rdv", label: "Rendez-vous", icon: "📌" },
    { to: "/photos", label: "Photos", icon: "🖼️" },
    { to: "/documents", label: "Documents", icon: "📂" },
    { to: "/enfants", label: "Enfants", icon: "👶" },
    { to: "/depenses", label: "Dépenses", icon: "💰" },
    { to: "/notifications", label: "Notifications", icon: "🔔" },
    { to: "/journal", label: "Journal", icon: "📖" },
    { to: "/abonnement", label: "Abonnement", icon: "💳" },
    { to: "/polls", label: "Sondages", icon: "📊" },
    { to: "/profil", label: "Profil", icon: "👤" },
    { to: "/settings", label: "Paramètres", icon: "⚙️" },
    { to: "/help", label: "Aide", icon: "❓" },
    { to: "/contact", label: "Contact", icon: "📞" },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg z-50 flex flex-col p-6 space-y-4 lg:static lg:translate-x-0"
        >
          <button onClick={onClose} className="self-end text-xl lg:hidden">
            ✖
          </button>
          <h2 className="text-xl font-bold mb-6">Co-Parents</h2>
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                  pathname === link.to
                    ? "text-blue-600 font-bold bg-blue-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
