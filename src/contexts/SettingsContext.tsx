"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type Language = 'cs' | 'en'
export type TableDensity = 'compact' | 'normal' | 'comfortable'

export interface AppSettings {
  language: Language
  tableDensity: TableDensity
  autoFocusSearch: boolean
  showRightSidebar: boolean
  defaultBlock: string
  defaultImportStrategy: 'skip' | 'update' | 'replace'
}

const defaultSettings: AppSettings = {
  language: 'cs',
  tableDensity: 'normal',
  autoFocusSearch: true,
  showRightSidebar: true,
  defaultBlock: '',
  defaultImportStrategy: 'skip',
}

interface SettingsContextType {
  settings: AppSettings
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('block_storage_settings')
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) })
      }
    } catch {}
    setLoaded(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('block_storage_settings', JSON.stringify(settings))
    }
  }, [settings, loaded])

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('block_storage_settings')
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider")
  return ctx
}
