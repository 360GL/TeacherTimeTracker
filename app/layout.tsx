import type React from "react"
import "./globals.css"

export const metadata = {
  title: "Suivi des Heures Enseignant",
  description: "Application de suivi des heures de travail selon la convention collective",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
