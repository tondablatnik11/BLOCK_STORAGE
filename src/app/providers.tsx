"use client"

import { ReactNode } from "react"
import { SettingsProvider } from "../contexts/SettingsContext"
import { AuthProvider } from "../contexts/AuthContext"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </AuthProvider>
  )
}
