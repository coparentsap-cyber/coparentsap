import { Link, useLocation } from "react-router-dom"

export default function BottomNav() {
  const { pathname } = useLocation()

  const tabs = [
    { to: "/", label: "Accueil", icon: "🏠" },
    { to: "/rdv", label: "Rendez-vous", icon: "📅" },
    { to: "/messages", label: "Messages", icon: "💬" },
    { to: "/photos", label: "Photos", icon: "🖼️" },
    { to: "/settings", label: "Profil", icon: "⚙️" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t shadow-md flex justify-around py-2 z-50 lg:hidden">
      {tabs.map((t) => (
        <Link
          key={t.to}
          to={t.to}
          className={`flex flex-col items-center text-xs px-3 py-1 rounded-md transition ${
            pathname === t.to
              ? "font-bold"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          style={{
            color: pathname === t.to ? "var(--brand-color)" : "",
          }}
        >
          <span className="text-xl">{t.icon}</span>
          {t.label}
        </Link>
      ))}
    </nav>
  )
}
