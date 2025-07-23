"use client"

import type React from "react"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

interface AuthFormProps {
  window.location.reload()
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        onAuthSuccess()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage("Vérifiez votre email pour confirmer votre compte!")
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        padding: "24px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "32px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>
            Suivi des Heures
          </h1>
          <p style={{ color: "#64748b" }}>{isLogin ? "Connectez-vous à votre compte" : "Créez votre compte"}</p>
        </div>

        <form onSubmit={handleAuth} style={{ display: "grid", gap: "20px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontWeight: "500",
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
                backgroundColor: "white",
                color: "#1e293b",
              }}
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontWeight: "500",
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
                backgroundColor: "white",
                color: "#1e293b",
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              backgroundColor: loading ? "#9ca3af" : "#3b82f6",
              color: "white",
              transition: "background-color 0.2s",
            }}
          >
            {loading ? "Chargement..." : isLogin ? "Se connecter" : "Créer un compte"}
          </button>
        </form>

        {message && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: message.includes("Vérifiez") ? "#dcfce7" : "#fef2f2",
              color: message.includes("Vérifiez") ? "#166534" : "#dc2626",
              fontSize: "0.875rem",
            }}
          >
            {message}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: "none",
              border: "none",
              color: "#3b82f6",
              cursor: "pointer",
              fontSize: "0.875rem",
              textDecoration: "underline",
            }}
          >
            {isLogin ? "Pas de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  )
}
