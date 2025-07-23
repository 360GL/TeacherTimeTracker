"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import AuthForm from "@/components/AuthForm"
import type { User } from "@supabase/supabase-js"

// Types d'activités avec couleurs
const ACTIVITY_TYPES = [
  { id: "face-a-face", name: "Face à face pédagogique", category: "Cours", isAnnex: false, color: "#3b82f6" },
  {
    id: "reunion-lyon2",
    name: "Réunion direction Lyon 2",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "reunion-petite-ecole",
    name: "Réunion direction Petite École",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "reunion-equipe",
    name: "Réunion équipe Petite École",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  { id: "reunions-parents", name: "Réunions parents", category: "Heures induites", isAnnex: false, color: "#f97316" },
  {
    id: "preparation-cours",
    name: "Préparation de cours",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "journees-pedagogiques",
    name: "Journées pédagogiques",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "journees-preparation",
    name: "Journées de préparation",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "app",
    name: "APP",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "journee-portes-ouvertes",
    name: "Journée portes-ouvertes",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "proposition-redaction-sujet",
    name: "Proposition et rédaction de sujet",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "reunion-pre-rentree",
    name: "Réunion de pré-rentrée rédaction des livrets élèves + évaluation des élèves",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "conseil-classe",
    name: "Conseil de classe",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "participation-jurys",
    name: "Participation au jurys internes / surveillance d'examen",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "formation-stagiaire",
    name: "Formation de stagiaire",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "conseils-discipline",
    name: "Conseils de discipline",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "remise-diplomes",
    name: "Remise des diplômes",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "surveillance-recreation",
    name: "Surveillance de récréation",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "accueil-remise-enfants",
    name: "Accueil et remise des enfants aux parents",
    category: "Heures induites",
    isAnnex: false,
    color: "#8b5cf6",
  },
  {
    id: "suivi-stage",
    name: "Suivi de stage",
    category: "Activité connexes",
    isAnnex: true,
    color: "#10b981",
  },
  {
    id: "surveillance-repas",
    name: "Surveillance de enfants pdt le repas",
    category: "Heures annexes",
    isAnnex: true,
    color: "#10b981",
  },
  {
    id: "surveillance-etudes",
    name: "Surveillance des enfants pdt les études dirigés",
    category: "Heures annexes",
    isAnnex: true,
    color: "#10b981",
  },
  { id: "autres", name: "Autres", category: "Heures annexes", isAnnex: true, color: "#10b981" },
]

interface Activity {
  id: string
  user_id: string
  type: string
  date: string
  duration: number
  comment?: string
  is_planned?: boolean
  created_at: string
}

export default function TeacherHoursTracker() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])
  const [newActivity, setNewActivity] = useState({
    type: "",
    date: new Date().toISOString().split("T")[0],
    duration: "",
    comment: "",
    is_planned: false,
  })
  const [activeTab, setActiveTab] = useState("dashboard")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const [stopwatchRunning, setStopwatchRunning] = useState(false)
  const [showStopwatchModal, setShowStopwatchModal] = useState(false)
  const [stopwatchInterval, setStopwatchInterval] = useState<NodeJS.Timeout | null>(null)

  // Vérifier l'authentification
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Charger les activités de l'utilisateur
  useEffect(() => {
    if (user) {
      loadActivities()
    }
  }, [user])

  const loadActivities = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur lors du chargement:", error)
    } else {
      setActivities(data || [])
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  // Ajouter une activité
  const addActivity = async () => {
    if (!user) return

    if (editingId) {
      // Mode édition
      if (!newActivity.type || !newActivity.duration) {
        alert("Veuillez remplir tous les champs obligatoires")
        return
      }

      const { error } = await supabase
        .from("activities")
        .update({
          type: newActivity.type,
          date: newActivity.date,
          duration: Number.parseFloat(newActivity.duration),
          comment: newActivity.comment,
          is_planned: newActivity.is_planned,
        })
        .eq("id", editingId)

      if (error) {
        console.error("Erreur lors de la modification:", error)
        alert("Erreur lors de la modification")
        return
      }

      setEditingId(null)
    } else {
      // Mode ajout
      if (!newActivity.type || !newActivity.duration) {
        alert("Veuillez remplir tous les champs obligatoires")
        return
      }

      const { error } = await supabase.from("activities").insert({
        user_id: user.id,
        type: newActivity.type,
        date: newActivity.date,
        duration: Number.parseFloat(newActivity.duration),
        comment: newActivity.comment,
        is_planned: newActivity.is_planned,
      })

      if (error) {
        console.error("Erreur lors de l'ajout:", error)
        alert("Erreur lors de l'ajout")
        return
      }
    }

    setNewActivity({
      type: "",
      date: new Date().toISOString().split("T")[0],
      duration: "",
      comment: "",
      is_planned: false,
    })
    setActiveTab("dashboard")
    loadActivities()
  }

  // Modifier une activité
  const editActivity = (activity: Activity) => {
    setNewActivity({
      type: activity.type,
      date: activity.date,
      duration: activity.duration.toString(),
      comment: activity.comment || "",
      is_planned: activity.is_planned || false,
    })
    setEditingId(activity.id)
    setActiveTab("add")
  }

  // Supprimer une activité
  const deleteActivity = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) return

    const { error } = await supabase.from("activities").delete().eq("id", id)

    if (error) {
      console.error("Erreur lors de la suppression:", error)
      alert("Erreur lors de la suppression")
    } else {
      loadActivities()
    }
  }

  // Annuler l'édition
  const cancelEdit = () => {
    setEditingId(null)
    setNewActivity({
      type: "",
      date: new Date().toISOString().split("T")[0],
      duration: "",
      comment: "",
      is_planned: false,
    })
    setActiveTab("dashboard")
  }

  // Fonctions du chronomètre
  const startStopwatch = () => {
    if (!stopwatchRunning) {
      const now = Date.now()
      setStopwatchRunning(true)

      const interval = setInterval(() => {
        setStopwatchTime(Date.now() - (now - stopwatchTime))
      }, 100)
      setStopwatchInterval(interval)
    } else {
      setStopwatchRunning(false)
      if (stopwatchInterval) {
        clearInterval(stopwatchInterval)
        setStopwatchInterval(null)
      }
    }
  }

  const resetStopwatch = () => {
    setStopwatchTime(0)
    setStopwatchRunning(false)
    if (stopwatchInterval) {
      clearInterval(stopwatchInterval)
      setStopwatchInterval(null)
    }
  }

  const saveStopwatchActivity = async (activityType: string) => {
    if (!user || stopwatchTime === 0) return

    const hours = Math.round((stopwatchTime / (1000 * 60 * 60)) * 100) / 100

    const { error } = await supabase.from("activities").insert({
      user_id: user.id,
      type: activityType,
      date: new Date().toISOString().split("T")[0],
      duration: hours,
      comment: `Chronométré: ${formatStopwatchTime(stopwatchTime)}`,
      is_planned: false,
    })

    if (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      alert("Erreur lors de la sauvegarde")
    } else {
      resetStopwatch()
      setShowStopwatchModal(false)
      loadActivities()
    }
  }

  const formatStopwatchTime = (time: number) => {
    const hours = Math.floor(time / (1000 * 60 * 60))
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((time % (1000 * 60)) / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`
    } else {
      return `${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`
    }
  }

  // Calculer l'année scolaire (septembre à août)
  const getSchoolYear = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return month >= 8 ? year : year - 1
  }

  const getCurrentSchoolYearRange = () => {
    const now = new Date()
    const schoolYear = getSchoolYear(now)
    return {
      start: new Date(schoolYear, 8, 1),
      end: new Date(schoolYear + 1, 7, 31),
    }
  }

  // Calculer les totaux
  const calculateTotals = () => {
    const schoolYear = getCurrentSchoolYearRange()

    const totals = {
      annual: { cours: 0, induites: 0, annexes: 0, total: 0 },
    }

    activities.forEach((activity) => {
      const activityDate = new Date(activity.date)
      const activityType = ACTIVITY_TYPES.find((t) => t.id === activity.type)
      if (!activityType) return

      const duration = activity.duration

      // Totaux annuels
      if (activityDate >= schoolYear.start && activityDate <= schoolYear.end) {
        if (activityType.category === "Cours") {
          totals.annual.cours += duration
        } else if (activityType.isAnnex) {
          totals.annual.annexes += duration
        } else {
          totals.annual.induites += duration
        }
        totals.annual.total += duration
      }
    })

    return totals
  }

  // Export CSV
  const exportCSV = () => {
    if (activities.length === 0) {
      alert("Aucune activité à exporter")
      return
    }

    const headers = ["Date", "Type d'activité", "Catégorie", "Durée (h)", "Commentaire", "Statut"]
    const rows = activities.map((activity) => {
      const activityType = ACTIVITY_TYPES.find((t) => t.id === activity.type)
      return [
        activity.date,
        activityType?.name || "",
        activityType?.category || "",
        activity.duration.toString(),
        activity.comment || "",
        activity.is_planned ? "Planifié" : "Réalisé",
      ]
    })

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `heures-enseignant-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  // Composant barre de progression
  const ProgressBar = ({
    current,
    max,
    color,
    isOverLimit,
  }: { current: number; max: number; color: string; isOverLimit?: boolean }) => {
    const percentage = Math.min((current / max) * 100, 100)

    return (
      <div
        style={{
          width: "100%",
          height: "8px",
          backgroundColor: "#e5e7eb",
          borderRadius: "4px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: isOverLimit ? "#ef4444" : color,
            borderRadius: "4px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <div style={{ fontSize: "1.125rem", color: "#64748b" }}>Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onAuthSuccess={() => setUser(user)} />
  }

  const totals = calculateTotals()

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", color: "#1e293b" }}>
      {/* Header */}
      <div style={{ backgroundColor: "white", borderBottom: "1px solid #e2e8f0", padding: "16px 24px" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1e293b" }}>Suivi des heures - {user.email}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setShowMobileMenu(true)}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
              }}
            >
              <div style={{ width: "20px", height: "2px", backgroundColor: "#64748b" }}></div>
              <div style={{ width: "20px", height: "2px", backgroundColor: "#64748b" }}></div>
              <div style={{ width: "20px", height: "2px", backgroundColor: "#64748b" }}></div>
            </button>
            <button
              onClick={handleSignOut}
              style={{
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: "white",
                color: "#64748b",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        {activeTab === "dashboard" && (
          <div>
            {/* Tableau de bord */}
            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "20px", color: "#1e293b" }}>
                Tableau de bord
              </h2>

              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}
              >
                {/* Total */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: "500" }}>Total</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" }}>
                    <span
                      style={{
                        fontSize: "2rem",
                        fontWeight: "700",
                        color: totals.annual.total > 1534 ? "#ef4444" : "#1e293b",
                      }}
                    >
                      {totals.annual.total}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#64748b" }}>/ 1534 h</span>
                  </div>
                  <ProgressBar
                    current={totals.annual.total}
                    max={1534}
                    color="#3b82f6"
                    isOverLimit={totals.annual.total > 1534}
                  />
                </div>

                {/* Face à face */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: "500" }}>Face & face</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" }}>
                    <span
                      style={{
                        fontSize: "2rem",
                        fontWeight: "700",
                        color: totals.annual.cours > 972 ? "#ef4444" : "#1e293b",
                      }}
                    >
                      {totals.annual.cours}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#64748b" }}>/ 972 h</span>
                  </div>
                  <ProgressBar
                    current={totals.annual.cours}
                    max={972}
                    color="#f97316"
                    isOverLimit={totals.annual.cours > 972}
                  />
                </div>

                {/* Induites */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: "500" }}>Induites</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" }}>
                    <span
                      style={{
                        fontSize: "2rem",
                        fontWeight: "700",
                        color: totals.annual.induites > 562 ? "#ef4444" : "#1e293b",
                      }}
                    >
                      {totals.annual.induites}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#64748b" }}>/ 562 h</span>
                  </div>
                  <ProgressBar
                    current={totals.annual.induites}
                    max={562}
                    color="#ef4444"
                    isOverLimit={totals.annual.induites > 562}
                  />
                </div>
              </div>
            </div>

            {/* Bouton Ajouter */}
            <button
              onClick={() => setActiveTab("add")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "white",
                border: "2px dashed #cbd5e1",
                borderRadius: "12px",
                padding: "16px 24px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500",
                color: "#64748b",
                width: "100%",
                marginBottom: "32px",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#3b82f6"
                e.currentTarget.style.color = "#3b82f6"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#cbd5e1"
                e.currentTarget.style.color = "#64748b"
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>+</span>
              Ajouter une activité
            </button>

            {/* Liste des activités récentes */}
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "16px", color: "#1e293b" }}>
                Activités récentes
              </h3>

              {activities.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  <p>Aucune activité enregistrée</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {activities.slice(0, 5).map((activity) => {
                    const activityType = ACTIVITY_TYPES.find((t) => t.id === activity.type)
                    return (
                      <div
                        key={activity.id}
                        style={{
                          backgroundColor: "white",
                          borderRadius: "8px",
                          padding: "16px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "4px",
                              height: "40px",
                              backgroundColor: activityType?.color || "#64748b",
                              borderRadius: "2px",
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: "500", color: "#1e293b", marginBottom: "4px" }}>
                              {activityType?.name}
                            </div>
                            <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                              {new Date(activity.date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                              {activity.comment && ` • ${activity.comment}`}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ fontWeight: "600", color: "#1e293b" }}>{activity.duration}h</div>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              onClick={() => editActivity(activity)}
                              style={{
                                background: "none",
                                border: "1px solid #d1d5db",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                color: "#64748b",
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteActivity(activity.id)}
                              style={{
                                background: "none",
                                border: "1px solid #fecaca",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                color: "#dc2626",
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "add" && (
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "32px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}
              >
                <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1e293b" }}>
                  {editingId ? "Modifier l'activité" : "Ajouter une activité"}
                </h2>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    color: "#64748b",
                    padding: "4px",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: "grid", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Type d'activité
                  </label>
                  <select
                    value={newActivity.type}
                    onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      backgroundColor: "white",
                      color: "#1e293b",
                    }}
                  >
                    <option value="">Sélectionner une activité</option>
                    {ACTIVITY_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={newActivity.date}
                    onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      backgroundColor: "white",
                      color: "#1e293b",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Durée
                  </label>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={newActivity.duration}
                      onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
                      placeholder="1"
                      style={{
                        width: "80px",
                        padding: "12px 16px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        backgroundColor: "white",
                        color: "#1e293b",
                        textAlign: "center",
                      }}
                    />
                    <span style={{ color: "#64748b", fontWeight: "500" }}>h</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                    Notes
                  </label>
                  <textarea
                    value={newActivity.comment}
                    onChange={(e) => setNewActivity({ ...newActivity, comment: e.target.value })}
                    placeholder="Détails supplémentaires..."
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      backgroundColor: "white",
                      color: "#1e293b",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button
                    onClick={() => (editingId ? cancelEdit() : setActiveTab("dashboard"))}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      backgroundColor: "white",
                      color: "#64748b",
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={addActivity}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      backgroundColor: "#3b82f6",
                      color: "white",
                    }}
                  >
                    {editingId ? "Sauvegarder" : "Ajouter"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "list" && (
          <div>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1e293b" }}>Toutes les activités</h2>
              <button
                onClick={exportCSV}
                style={{
                  backgroundColor: "#10b981",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Export CSV
              </button>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {activities.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  <p>Aucune activité enregistrée</p>
                </div>
              ) : (
                activities.map((activity) => {
                  const activityType = ACTIVITY_TYPES.find((t) => t.id === activity.type)
                  return (
                    <div
                      key={activity.id}
                      style={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        padding: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "4px",
                            height: "40px",
                            backgroundColor: activityType?.color || "#64748b",
                            borderRadius: "2px",
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: "500", color: "#1e293b", marginBottom: "4px" }}>
                            {activityType?.name}
                          </div>
                          <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                            {new Date(activity.date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                            {activity.comment && ` • ${activity.comment}`}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ fontWeight: "600", color: "#1e293b" }}>{activity.duration}h</div>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={() => editActivity(activity)}
                            style={{
                              background: "none",
                              border: "1px solid #d1d5db",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              color: "#64748b",
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteActivity(activity.id)}
                            style={{
                              background: "none",
                              border: "1px solid #fecaca",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              color: "#dc2626",
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "stopwatch" && (
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "32px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                textAlign: "center",
              }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1e293b", marginBottom: "32px" }}>
                Chronomètre
              </h2>

              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: "700",
                  color: stopwatchRunning ? "#3b82f6" : "#1e293b",
                  marginBottom: "32px",
                  fontFamily: "monospace",
                }}
              >
                {formatStopwatchTime(stopwatchTime)}
              </div>

              <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "24px" }}>
                <button
                  onClick={startStopwatch}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    backgroundColor: stopwatchRunning ? "#ef4444" : "#10b981",
                    color: "white",
                    minWidth: "120px",
                  }}
                >
                  {stopwatchRunning ? "⏸️ Pause" : "▶️ Start"}
                </button>
                <button
                  onClick={resetStopwatch}
                  style={{
                    padding: "12px 24px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    backgroundColor: "white",
                    color: "#64748b",
                    minWidth: "120px",
                  }}
                >
                  🔄 Reset
                </button>
              </div>

              {stopwatchTime > 0 && !stopwatchRunning && (
                <button
                  onClick={() => setShowStopwatchModal(true)}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    width: "100%",
                  }}
                >
                  💾 Enregistrer cette session
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de sauvegarde du chronomètre */}
      {showStopwatchModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowStopwatchModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b" }}>Enregistrer la session</h3>
              <button
                onClick={() => setShowStopwatchModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#3b82f6", marginBottom: "8px" }}>
                {formatStopwatchTime(stopwatchTime)}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                Soit {Math.round((stopwatchTime / (1000 * 60 * 60)) * 100) / 100} heures
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                Type d'activité
              </label>
              <select
                id="stopwatch-activity-type"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  backgroundColor: "white",
                  color: "#1e293b",
                }}
              >
                <option value="">Sélectionner une activité</option>
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowStopwatchModal(false)}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  backgroundColor: "white",
                  color: "#64748b",
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const select = document.getElementById("stopwatch-activity-type") as HTMLSelectElement
                  if (select.value) {
                    saveStopwatchActivity(select.value)
                  } else {
                    alert("Veuillez sélectionner un type d'activité")
                  }
                }}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  backgroundColor: "#3b82f6",
                  color: "white",
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu mobile */}
      {showMobileMenu && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setShowMobileMenu(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              width: "280px",
              height: "100%",
              padding: "24px",
              boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b" }}>Menu</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <button
                onClick={() => {
                  setActiveTab("dashboard")
                  setShowMobileMenu(false)
                }}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  backgroundColor: activeTab === "dashboard" ? "#eff6ff" : "transparent",
                  color: activeTab === "dashboard" ? "#3b82f6" : "#64748b",
                  textAlign: "left",
                }}
              >
                📊 Tableau de bord
              </button>
              <button
                onClick={() => {
                  setActiveTab("add")
                  setShowMobileMenu(false)
                }}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  backgroundColor: activeTab === "add" ? "#eff6ff" : "transparent",
                  color: activeTab === "add" ? "#3b82f6" : "#64748b",
                  textAlign: "left",
                }}
              >
                ➕ Ajouter
              </button>
              <button
                onClick={() => {
                  setActiveTab("list")
                  setShowMobileMenu(false)
                }}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  backgroundColor: activeTab === "list" ? "#eff6ff" : "transparent",
                  color: activeTab === "list" ? "#3b82f6" : "#64748b",
                  textAlign: "left",
                }}
              >
                📋 Liste
              </button>
              <button
                onClick={() => {
                  setActiveTab("stopwatch")
                  setShowMobileMenu(false)
                }}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  backgroundColor: activeTab === "stopwatch" ? "#eff6ff" : "transparent",
                  color: activeTab === "stopwatch" ? "#3b82f6" : "#64748b",
                  textAlign: "left",
                }}
              >
                ⏱️ Chronomètre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation mobile */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderTop: "1px solid #e2e8f0",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "center",
          gap: "24px",
        }}
      >
        <button
          onClick={() => setActiveTab("dashboard")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: activeTab === "dashboard" ? "#3b82f6" : "#64748b",
            backgroundColor: activeTab === "dashboard" ? "#eff6ff" : "transparent",
          }}
        >
          Tableau de bord
        </button>
        <button
          onClick={() => setActiveTab("add")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: activeTab === "add" ? "#3b82f6" : "#64748b",
            backgroundColor: activeTab === "add" ? "#eff6ff" : "transparent",
          }}
        >
          Ajouter
        </button>
        <button
          onClick={() => setActiveTab("list")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: activeTab === "list" ? "#3b82f6" : "#64748b",
            backgroundColor: activeTab === "list" ? "#eff6ff" : "transparent",
          }}
        >
          Liste
        </button>
        <button
          onClick={() => setActiveTab("stopwatch")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: activeTab === "stopwatch" ? "#3b82f6" : "#64748b",
            backgroundColor: activeTab === "stopwatch" ? "#eff6ff" : "transparent",
          }}
        >
          Chrono
        </button>
      </div>
    </div>
  )
}
