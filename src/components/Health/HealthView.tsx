import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Heart, Plus, User, Clock, X, Phone, MapPin } from "lucide-react"
import { format, isBefore, isToday, isTomorrow } from "date-fns"
import { fr } from "date-fns/locale"
import { useAuth } from "../../contexts/AuthContext"

interface HealthRecord {
  id: string
  type: "rdv" | "vaccin" | "traitement" | "urgence"
  titre: string
  description: string
  date: string
  heure?: string
  enfant_id?: string
  enfant_nom?: string
  medecin?: {
    nom: string
    telephone?: string
    adresse?: string
  }
  statut: "prevu" | "fait" | "annule"
  rappel_active: boolean
  created_at: string
}

const HealthView: React.FC = () => {
  const { user, profile } = useAuth()
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null)
  const [filter, setFilter] = useState<"tous" | "rdv" | "vaccin" | "traitement" | "urgence">("tous")

  useEffect(() => {
    loadHealthRecords()
  }, [user])

  const loadHealthRecords = () => {
    if (!user) return

    try {
      const savedRecords = localStorage.getItem(`health_${user.id}`)
      if (savedRecords) {
        const records = JSON.parse(savedRecords)
        setRecords(
          records.sort(
            (a: HealthRecord, b: HealthRecord) =>
              new Date(a.date + " " + (a.heure || "00:00")).getTime() -
              new Date(b.date + " " + (b.heure || "00:00")).getTime()
          )
        )
      } else {
        // Générer quelques enregistrements de démo
        const demoRecords: HealthRecord[] = [
          {
            id: "1",
            type: "rdv",
            titre: "Contrôle annuel Emma",
            description: "Visite de routine chez le pédiatre pour Emma",
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            heure: "14:30",
            enfant_id: "enfant-1",
            enfant_nom: "Emma",
            medecin: {
              nom: "Dr. Sophie Dubois",
              telephone: "01 45 62 78 34",
              adresse: "45 Avenue des Champs, 75008 Paris",
            },
            statut: "prevu",
            rappel_active: true,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "2",
            type: "vaccin",
            titre: "Rappel DTP Lucas",
            description: "Vaccination de rappel Diphtérie-Tétanos-Poliomyélite",
            date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            heure: "10:00",
            enfant_id: "enfant-2",
            enfant_nom: "Lucas",
            medecin: {
              nom: "Dr. Michel Leroy",
              telephone: "01 43 67 89 23",
              adresse: "12 Place de la Nation, 75012 Paris",
            },
            statut: "prevu",
            rappel_active: true,
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "3",
            type: "traitement",
            titre: "Traitement allergie Léa",
            description:
              "Antihistaminique pour allergie saisonnière - 1 comprimé/jour pendant 10 jours",
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            enfant_id: "enfant-3",
            enfant_nom: "Léa",
            statut: "fait",
            rappel_active: false,
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "4",
            type: "rdv",
            titre: "Orthodontiste Emma",
            description: "Consultation pour évaluer le besoin d'un appareil dentaire",
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            heure: "16:00",
            enfant_id: "enfant-1",
            enfant_nom: "Emma",
            medecin: {
              nom: "Dr. Claire Martin",
              telephone: "01 42 78 56 34",
              adresse: "28 Rue de la Paix, 75002 Paris",
            },
            statut: "prevu",
            rappel_active: true,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]
        localStorage.setItem(`health_${user.id}`, JSON.stringify(demoRecords))
        setRecords(demoRecords)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données santé:", error)
    }
  }

  const saveRecord = (recordData: Omit<HealthRecord, "id" | "created_at">) => {
    if (!user) return

    const newRecord: HealthRecord = {
      ...recordData,
      id: editingRecord?.id || Date.now().toString(),
      created_at: editingRecord?.created_at || new Date().toISOString(),
    }

    let updatedRecords
    if (editingRecord) {
      updatedRecords = records.map((record) =>
        record.id === editingRecord.id ? newRecord : record
      )
    } else {
      updatedRecords = [...records, newRecord]
    }

    // Trier par date
    updatedRecords.sort(
      (a, b) =>
        new Date(a.date + " " + (a.heure || "00:00")).getTime() -
        new Date(b.date + " " + (b.heure || "00:00")).getTime()
    )

    localStorage.setItem(`health_${user.id}`, JSON.stringify(updatedRecords))
    setRecords(updatedRecords)
    setShowForm(false)
    setEditingRecord(null)
  }

  const updateStatus = (id: string, newStatus: HealthRecord["statut"]) => {
    const updatedRecords = records.map((record) =>
      record.id === id ? { ...record, statut: newStatus } : record
    )
    localStorage.setItem(`health_${user?.id}`, JSON.stringify(updatedRecords))
    setRecords(updatedRecords)
  }

  const deleteRecord = (id: string) => {
    if (!confirm("Supprimer cet enregistrement ?")) return

    const updatedRecords = records.filter((record) => record.id !== id)
    localStorage.setItem(`health_${user?.id}`, JSON.stringify(updatedRecords))
    setRecords(updatedRecords)
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const handleNavigate = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    const wazeUrl = `https://waze.com/ul?q=${encodedAddress}&navigate=yes`
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`

    window.open(wazeUrl, "_blank") || window.open(googleMapsUrl, "_blank")
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "rdv":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "vaccin":
        return "bg-green-100 text-green-800 border-green-200"
      case "traitement":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "urgence":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "rdv":
        return "🩺"
      case "vaccin":
        return "💉"
      case "traitement":
        return "💊"
      case "urgence":
        return "🚨"
      default:
        return "📋"
    }
  }

  const getDateStatus = (date: string) => {
    const recordDate = new Date(date)
    if (isToday(recordDate)) return { text: "Aujourd'hui", color: "text-red-600 font-bold" }
    if (isTomorrow(recordDate)) return { text: "Demain", color: "text-orange-600 font-semibold" }
    if (isBefore(recordDate, new Date())) return { text: "Passé", color: "text-gray-500" }
    return { text: format(recordDate, "dd MMM", { locale: fr }), color: "text-gray-700" }
  }

  const filteredRecords =
    filter === "tous" ? records : records.filter((record) => record.type === filter)

  const HealthForm = ({
    record,
    onSave,
    onCancel,
  }: {
    record?: HealthRecord
    onSave: (data: Omit<HealthRecord, "id" | "created_at">) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      type: record?.type || ("rdv" as const),
      titre: record?.titre || "",
      description: record?.description || "",
      date: record?.date || new Date().toISOString().split("T")[0],
      heure: record?.heure || "",
      enfant_id: record?.enfant_id || "",
      enfant_nom: record?.enfant_nom || "",
      medecin: record?.medecin || { nom: "", telephone: "", adresse: "" },
      statut: record?.statut || ("prevu" as const),
      rappel_active: record?.rappel_active ?? true,
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSave(formData)
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {record ? "Modifier" : "Nouvel"} enregistrement santé
              </h3>
              <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, type: e.target.value as any }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rdv">🩺 Rendez-vous</option>
                    <option value="vaccin">💉 Vaccination</option>
                    <option value="traitement">💊 Traitement</option>
                    <option value="urgence">🚨 Urgence</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enfant</label>
                  <select
                    value={formData.enfant_nom}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        enfant_nom: e.target.value,
                        enfant_id: e.target.value ? `enfant-${e.target.value}` : "",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les enfants</option>
                    {profile?.enfants?.map((enfant) => (
                      <option key={enfant.id} value={enfant.prenom}>
                        {enfant.prenom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData((prev) => ({ ...prev, titre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Contrôle annuel, Vaccination ROR..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Détails, instructions, notes..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure (optionnel)
                  </label>
                  <input
                    type="time"
                    value={formData.heure}
                    onChange={(e) => setFormData((prev) => ({ ...prev, heure: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Informations médecin */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Professionnel de santé</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nom du médecin/professionnel"
                    value={formData.medecin.nom}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        medecin: { ...prev.medecin, nom: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="tel"
                      placeholder="Téléphone"
                      value={formData.medecin.telephone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          medecin: { ...prev.medecin, telephone: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={formData.statut}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, statut: e.target.value as any }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="prevu">📅 Prévu</option>
                      <option value="fait">✅ Fait</option>
                      <option value="annule">❌ Annulé</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Adresse du cabinet"
                    value={formData.medecin.adresse}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        medecin: { ...prev.medecin, adresse: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="rappel"
                  checked={formData.rappel_active}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, rappel_active: e.target.checked }))
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="rappel" className="text-sm text-gray-700">
                  Activer les rappels automatiques
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
                >
                  {record ? "Modifier" : "Créer"} l'enregistrement
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Suivi Santé</h1>
              <p className="text-gray-600">Gérez la santé de vos enfants</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingRecord(null)
              setShowForm(true)
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau</span>
          </button>
        </div>

        {/* Filtres */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {[
            { id: "tous", label: "Tous", emoji: "📋" },
            { id: "rdv", label: "RDV", emoji: "🩺" },
            { id: "vaccin", label: "Vaccins", emoji: "💉" },
            { id: "traitement", label: "Traitements", emoji: "💊" },
            { id: "urgence", label: "Urgences", emoji: "🚨" },
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === filterOption.id
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filterOption.emoji} {filterOption.label}
            </button>
          ))}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {records.filter((r) => r.type === "rdv" && r.statut === "prevu").length}
            </div>
            <div className="text-sm text-gray-600">RDV prévus</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {records.filter((r) => r.type === "vaccin").length}
            </div>
            <div className="text-sm text-gray-600">Vaccinations</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {records.filter((r) => r.type === "traitement").length}
            </div>
            <div className="text-sm text-gray-600">Traitements</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {records.filter((r) => r.rappel_active && r.statut === "prevu").length}
            </div>
            <div className="text-sm text-gray-600">Rappels actifs</div>
          </div>
        </div>

        {/* Liste des enregistrements */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enregistrement santé</h3>
            <p className="text-gray-500 mb-6">Commencez à suivre la santé de vos enfants.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Premier enregistrement
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const dateStatus = getDateStatus(record.date)

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{getTypeIcon(record.type)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{record.titre}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className={`font-medium ${dateStatus.color}`}>
                            {dateStatus.text}
                          </span>
                          {record.heure && <span>à {record.heure}</span>}
                          <span
                            className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(record.type)}`}
                          >
                            {record.type}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs border ${
                              record.statut === "fait"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : record.statut === "annule"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : "bg-blue-100 text-blue-800 border-blue-200"
                            }`}
                          >
                            {record.statut}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {record.statut === "prevu" && (
                        <select
                          value={record.statut}
                          onChange={(e) =>
                            updateStatus(record.id, e.target.value as HealthRecord["statut"])
                          }
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="prevu">Prévu</option>
                          <option value="fait">Fait</option>
                          <option value="annule">Annulé</option>
                        </select>
                      )}
                      <button
                        onClick={() => {
                          setEditingRecord(record)
                          setShowForm(true)
                        }}
                        className="text-blue-500 hover:text-blue-700 p-1"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteRecord(record.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {record.description && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-gray-700 text-sm">{record.description}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    {record.enfant_nom && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{record.enfant_nom}</span>
                      </div>
                    )}

                    {record.medecin?.nom && (
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4" />
                          <span>{record.medecin.nom}</span>
                        </div>
                        <div className="flex space-x-2">
                          {record.medecin.telephone && (
                            <button
                              onClick={() => handleCall(record.medecin!.telephone!)}
                              className="text-green-600 hover:text-green-700"
                              title="Appeler"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          )}
                          {record.medecin.adresse && (
                            <button
                              onClick={() => handleNavigate(record.medecin!.adresse!)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Naviguer"
                            >
                              <MapPin className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {record.rappel_active && record.statut === "prevu" && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-yellow-700">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Rappel automatique activé</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Modal formulaire */}
        {showForm && (
          <HealthForm
            record={editingRecord || undefined}
            onSave={saveRecord}
            onCancel={() => {
              setShowForm(false)
              setEditingRecord(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default HealthView
