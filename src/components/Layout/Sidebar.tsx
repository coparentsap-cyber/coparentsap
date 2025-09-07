import { Link, useLocation } from "react-router-dom"

export default function Sidebar() {
  const { pathname } = useLocation()

  const links = [
    { to: "/", label: "Accueil", icon: "🏠" },
    { to: "/rdv", label: "Rendez-vous", icon: "📅" },
    { to: "/messages", label: "Messages", icon: "💬" },
    { to: "/photos", label: "Photos", icon: "🖼️" },
    { to: "/documents", label: "Documents", icon: "📂" },
    { to: "/notifications", label: "Notifications", icon: "🔔" },
    { to: "/journal", label: "Journal", icon: "📓" },
    { to: "/enfants", label: "Enfants", icon: "👨‍👩‍👧‍👦" },
    { to: "/depenses", label: "Dépenses", icon: "💶" },
    { to: "/abonnement", label: "Abonnement", icon: "💳" },
    { to: "/settings", label: "Paramètres", icon: "⚙️" },
  ]

  return (
    <aside className="w-60 bg-gray-50 dark:bg-gray-900 border-r p-4 hidden lg:flex flex-col">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Co-Parents</h2>
      <nav className="flex flex-col gap-2 flex-1">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
              pathname === link.to
                ? "font-bold bg-blue-50 dark:bg-gray-800"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            style={{
              color: pathname === link.to ? "var(--brand-color)" : "",
            }}
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
