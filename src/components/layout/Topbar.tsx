"use client"

import { useState } from "react"
import { Search, Settings } from "lucide-react"
import SettingsDrawer from "../settings/SettingsDrawer"
import UserMenu from "../auth/UserMenu"

export default function Topbar() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <header className="h-16 bg-[#060d1b]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-30">
        {/* Left — Page Title */}
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">BLOCK STORAGE</h2>
            <p className="text-xs text-slate-500 font-medium">Přehled a správa externího skladu</p>
          </div>
        </div>

        {/* Center — Global Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Vyhledat HU, materiál, pozi..."
              className="w-full pl-10 pr-16 py-2 bg-[#0a1628] border border-white/[0.06] rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-[10px] font-mono text-slate-600 bg-[#0d1b2a] px-1.5 py-0.5 rounded-md border border-white/[0.06]">⌘K</span>
            </div>
          </div>
        </div>

        {/* Right — Actions & Profile */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSettingsOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] rounded-lg transition-all"
            title="Nastavení"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
          
          <div className="h-7 w-px bg-white/[0.08] mx-1"></div>
          
          <UserMenu />
        </div>
      </header>

      <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
