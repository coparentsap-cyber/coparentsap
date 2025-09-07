import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

export default function MobileMenu() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  const links = [
    { to: "/profil", label: "Profil", icon: "👤" },
    { to: "/coparents", label: "Co-Parents", icon: "👥" },
    { to: "/documents", label: "Documents", icon: "📂" },
    { to: "/sante", label: "Suivi Santé", icon: "💚" },
    { to: "/rendezvous", label: "Rendez-vous", icon: "🗓️" },
    { to: "/abonnement", label: "Abonnement", icon: "💳" },
    { to: "/parametres", label: "Paramètres", icon: "⚙️" },
    { to: "/aide", label: "Aide/FAQ", icon: "❓" },
  ]

  return (
    <header className="lg:hidden bg-white border-b shadow-md p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">Co-Parents</h1>
      <button onClick={() => setOpen(!open)} className="text-2xl">
        ☰
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg z-50 flex flex-col p-6 space-y-4"
          >
            <button onClick={() => setOpen(false)} className="self-end text-xl mb-4">
              ✖
            </button>

            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-lg transition ${
                  pathname === link.to
                    ? "text-blue-600 font-bold bg-blue-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
