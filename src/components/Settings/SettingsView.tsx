import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../contexts/ThemeContext"
import { useState, useEffect } from "react"

const COLORS = [
  { name: "Bleu", value: "#2563eb" },
  { name: "Vert", value: "#16a34a" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Rose", value: "#db2777" },
  { name: "Orange", value: "#ea580c" },
]

export default function SettingsView() {
  const { signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [brandColor, setBrandColor] = useState(localStorage.getItem("brandColor") || "#2563eb")

  useEffect(() => {
    document.documentElement.style.setProperty("--brand-color", brandColor)
    localStorage.setItem("brandColor", brandColor)
  }, [brandColor])

  async function handleLogout() {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await signOut()
      navigate("/login")
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">⚙️ Paramètres</h1>

      <div className="space-y-6">
        {/* ✅ Thème clair/sombre */}
        <div className="flex items-center justify-between">
          <span className="text-gray-800 dark:text-gray-200">Mode sombre</span>
          <button
            onClick={toggleTheme}
            className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {theme === "light" ? "🌙 Activer" : "☀️ Désactiver"}
          </button>
        </div>

        {/* ✅ Choix de couleur */}
        <div>
          <p className="text-gray-800 dark:text-gray-200 mb-2">🎨 Couleur principale</p>
          <div className="flex gap-3">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setBrandColor(c.value)}
                className={`w-8 h-8 rounded-full border-2 ${
                  brandColor === c.value ? "border-black dark:border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>

        {/* ✅ Bouton déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          🚪 Se déconnecter
        </button>
      </div>
    </div>
  )
}
