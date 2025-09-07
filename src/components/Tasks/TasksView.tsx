import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckSquare, Plus, X, Calendar, User, Clock, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useAuth } from "../../contexts/AuthContext"

interface Task {
  id: string
  titre: string
  description: string
  priorite: "basse" | "moyenne" | "haute" | "urgente"
  statut: "a_faire" | "en_cours" | "terminee"
  assignee: string
  date_echeance?: string
  enfant_concerne?: string
  created_at: string
  completed_at?: string
}

const TasksView: React.FC = () => {
  const { user, profile } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<"toutes" | "a_faire" | "en_cours" | "terminee">("toutes")

  useEffect(() => {
    loadTasks()
  }, [user])

  const loadTasks = () => {
    if (!user) return

    try {
      const savedTasks = localStorage.getItem(`tasks_${user.id}`)
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks)
        setTasks(
          tasks.sort(
            (a: Task, b: Task) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        )
      } else {
        // Générer quelques tâches de démo
        const demoTasks: Task[] = [
          {
            id: "1",
            titre: "Acheter des vêtements d'hiver pour Emma",
            description:
              "Emma a grandi, il faut lui acheter un nouveau manteau et des bottes pour l'hiver.",
            priorite: "haute",
            statut: "a_faire",
            assignee: "Papa",
            date_echeance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            enfant_concerne: "Emma",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "2",
            titre: "Prendre RDV dentiste pour Lucas",
            description:
              "Contrôle annuel chez le dentiste pour Lucas. Appeler le cabinet du Dr. Martin.",
            priorite: "moyenne",
            statut: "en_cours",
            assignee: "Maman",
            date_echeance: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            enfant_concerne: "Lucas",
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "3",
            titre: "Inscription activité extra-scolaire Léa",
            description:
              "Léa souhaite faire du théâtre. Chercher les options dans le quartier et l'inscrire.",
            priorite: "basse",
            statut: "terminee",
            assignee: "Papa",
            enfant_concerne: "Léa",
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "4",
            titre: "Organiser fête d'anniversaire Emma",
            description:
              "Préparer la fête d'anniversaire d'Emma : invitations, gâteau, décorations, activités.",
            priorite: "urgente",
            statut: "a_faire",
            assignee: "Les deux",
            date_echeance: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            enfant_concerne: "Emma",
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]
        localStorage.setItem(`tasks_${user.id}`, JSON.stringify(demoTasks))
        setTasks(demoTasks)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error)
    }
  }

  const saveTask = (taskData: Omit<Task, "id" | "created_at">) => {
    if (!user) return

    const newTask: Task = {
      ...taskData,
      id: editingTask?.id || Date.now().toString(),
      created_at: editingTask?.created_at || new Date().toISOString(),
    }

    let updatedTasks
    if (editingTask) {
      updatedTasks = tasks.map((task) => (task.id === editingTask.id ? newTask : task))
    } else {
      updatedTasks = [newTask, ...tasks]
    }

    localStorage.setItem(`tasks_${user.id}`, JSON.stringify(updatedTasks))
    setTasks(updatedTasks)
    setShowForm(false)
    setEditingTask(null)
  }

  const updateTaskStatus = (id: string, newStatus: Task["statut"]) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return {
          ...task,
          statut: newStatus,
          completed_at: newStatus === "terminee" ? new Date().toISOString() : undefined,
        }
      }
      return task
    })

    localStorage.setItem(`tasks_${user?.id}`, JSON.stringify(updatedTasks))
    setTasks(updatedTasks)
  }

  const deleteTask = (id: string) => {
    if (!confirm("Supprimer cette tâche ?")) return

    const updatedTasks = tasks.filter((task) => task.id !== id)
    localStorage.setItem(`tasks_${user?.id}`, JSON.stringify(updatedTasks))
    setTasks(updatedTasks)
  }

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case "urgente":
        return "bg-red-100 text-red-800 border-red-200"
      case "haute":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "moyenne":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "basse":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "terminee":
        return "bg-green-100 text-green-800 border-green-200"
      case "en_cours":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "a_faire":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredTasks = filter === "toutes" ? tasks : tasks.filter((task) => task.statut === filter)

  const TaskForm = ({
    task,
    onSave,
    onCancel,
  }: {
    task?: Task
    onSave: (data: Omit<Task, "id" | "created_at">) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      titre: task?.titre || "",
      description: task?.description || "",
      priorite: task?.priorite || ("moyenne" as const),
      statut: task?.statut || ("a_faire" as const),
      assignee: task?.assignee || "",
      date_echeance: task?.date_echeance || "",
      enfant_concerne: task?.enfant_concerne || "",
      completed_at: task?.completed_at,
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
                {task ? "Modifier" : "Nouvelle"} tâche
              </h3>
              <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData((prev) => ({ ...prev, titre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Que faut-il faire ?"
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
                  placeholder="Détails de la tâche..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                  <select
                    value={formData.priorite}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, priorite: e.target.value as any }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basse">🟢 Basse</option>
                    <option value="moyenne">🟡 Moyenne</option>
                    <option value="haute">🟠 Haute</option>
                    <option value="urgente">🔴 Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, statut: e.target.value as any }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="a_faire">📋 À faire</option>
                    <option value="en_cours">⏳ En cours</option>
                    <option value="terminee">✅ Terminée</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigné à</label>
                  <select
                    value={formData.assignee}
                    onChange={(e) => setFormData((prev) => ({ ...prev, assignee: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choisir...</option>
                    <option value="Papa">Papa</option>
                    <option value="Maman">Maman</option>
                    <option value="Les deux">Les deux</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Échéance</label>
                  <input
                    type="date"
                    value={formData.date_echeance}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date_echeance: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enfant concerné
                </label>
                <select
                  value={formData.enfant_concerne}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, enfant_concerne: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Aucun enfant spécifique</option>
                  {profile?.enfants?.map((enfant) => (
                    <option key={enfant.id} value={enfant.prenom}>
                      {enfant.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
                >
                  {task ? "Modifier" : "Créer"} la tâche
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
            <CheckSquare className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tâches partagées</h1>
              <p className="text-gray-600">Organisez-vous ensemble</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingTask(null)
              setShowForm(true)
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle tâche</span>
          </button>
        </div>

        {/* Filtres */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {[
            { id: "toutes", label: "Toutes", emoji: "📋" },
            { id: "a_faire", label: "À faire", emoji: "⏳" },
            { id: "en_cours", label: "En cours", emoji: "🔄" },
            { id: "terminee", label: "Terminées", emoji: "✅" },
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === filterOption.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filterOption.emoji} {filterOption.label}
            </button>
          ))}
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">
              {tasks.filter((t) => t.statut === "a_faire").length}
            </div>
            <div className="text-sm text-gray-600">À faire</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {tasks.filter((t) => t.statut === "en_cours").length}
            </div>
            <div className="text-sm text-gray-600">En cours</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {tasks.filter((t) => t.statut === "terminee").length}
            </div>
            <div className="text-sm text-gray-600">Terminées</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {tasks.filter((t) => t.priorite === "urgente" && t.statut !== "terminee").length}
            </div>
            <div className="text-sm text-gray-600">Urgentes</div>
          </div>
        </div>

        {/* Liste des tâches */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche</h3>
            <p className="text-gray-500 mb-6">
              Créez votre première tâche pour commencer à vous organiser.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Créer une tâche
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.titre}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs border ${getPrioriteColor(task.priorite)}`}
                      >
                        {task.priorite}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs border ${getStatutColor(task.statut)}`}
                      >
                        {task.statut.replace("_", " ")}
                      </span>
                    </div>

                    {task.description && <p className="text-gray-600 mb-3">{task.description}</p>}

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {task.assignee}
                      </span>
                      {task.enfant_concerne && (
                        <span className="flex items-center">👶 {task.enfant_concerne}</span>
                      )}
                      {task.date_echeance && (
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(task.date_echeance), "dd/MM/yyyy")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {task.statut !== "terminee" && (
                      <select
                        value={task.statut}
                        onChange={(e) =>
                          updateTaskStatus(task.id, e.target.value as Task["statut"])
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="a_faire">À faire</option>
                        <option value="en_cours">En cours</option>
                        <option value="terminee">Terminée</option>
                      </select>
                    )}
                    <button
                      onClick={() => {
                        setEditingTask(task)
                        setShowForm(true)
                      }}
                      className="text-blue-500 hover:text-blue-700 p-1"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {task.completed_at && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                    <p className="text-green-700 text-sm">
                      ✅ Terminée le {format(new Date(task.completed_at), "dd/MM/yyyy à HH:mm")}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal formulaire */}
        {showForm && (
          <TaskForm
            task={editingTask || undefined}
            onSave={saveTask}
            onCancel={() => {
              setShowForm(false)
              setEditingTask(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default TasksView
