import { useAuth } from "../contexts/AuthContext"

export default function Profile() {
  const { profile } = useAuth()

  // ➡️ Exemple statique comme ta capture
  const enfants = [
    {
      nom: "Emma",
      ecole: "École Primaire Jean Jaurès",
      medecin: "Dr. Dr. Sophie Dubois",
      allergies: "Arachides, Fruits à coque",
      groupe: "A+",
    },
    {
      nom: "Lucas",
      ecole: "École Maternelle Les Petits Loups",
      medecin: "Dr. Dr. Leroy",
      allergies: "Lactose",
      groupe: "O-",
    },
    {
      nom: "Léa",
      ecole: "École Primaire Victor Hugo",
      medecin: "Dr. Dr. Anne Moreau",
      allergies: "Œufs, Gluten",
      groupe: "B+",
    },
  ]

  return (
    <div className="space-y-6 pb-24">
      {/* ✅ En-tête profil */}
      <header className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl">
          👤
        </div>
        <div>
          <h1 className="text-2xl font-bold">Mon profil</h1>
          <p className="text-gray-500">{profile?.email || "Utilisateur Démo"}</p>
        </div>
      </header>

      {/* ✅ Section enfants */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Mes enfants</h2>
        <div className="space-y-4">
          {enfants.map((enfant) => (
            <div key={enfant.nom} className="card p-4 space-y-2">
              <h3 className="text-lg font-bold">{enfant.nom}</h3>

              <div className="flex items-center justify-between bg-blue-50 border rounded-lg px-3 py-2">
                <span>📅 {enfant.ecole}</span>
                <div className="flex gap-3">
                  <button className="text-green-600">📞</button>
                  <button className="text-blue-600">📍</button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-green-50 border rounded-lg px-3 py-2">
                <span>❤️ {enfant.medecin}</span>
                <div className="flex gap-3">
                  <button className="text-green-600">📞</button>
                  <button className="text-blue-600">📍</button>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2">
                ⚠️ Allergies: {enfant.allergies}
              </div>

              <div className="bg-gray-50 border rounded-lg px-3 py-2">Groupe: {enfant.groupe}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ Statistiques */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Statistiques</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">12</p>
            <p className="text-gray-600">Jours ce mois</p>
          </div>
          <div className="bg-blue-50 border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">45</p>
            <p className="text-gray-600">Photos partagées</p>
          </div>
        </div>
      </section>
    </div>
  )
}
