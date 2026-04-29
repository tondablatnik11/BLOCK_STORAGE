"use client"

import { X, Settings, Globe, Table2, Search, PanelRight, Package, Upload, RotateCcw, Info } from "lucide-react"
import { useSettings, Language, TableDensity } from "../../contexts/SettingsContext"

interface SettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { settings, updateSetting, resetSettings } = useSettings()

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[380px] bg-[#0a1628] border-l border-white/[0.06] z-50 shadow-2xl animate-in slide-in-from-right-full duration-300 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-500/15 rounded-xl">
                <Settings className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Nastavení</h2>
                <p className="text-xs text-slate-500">Přizpůsobte si aplikaci</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          {/* ═══ VZHLED ═══ */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Vzhled</h3>
            <div className="space-y-4">
              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Jazyk</span>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value as Language)}
                  className="bg-[#060d1b] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/30"
                >
                  <option value="cs">Čeština</option>
                  <option value="en">English</option>
                </select>
              </div>

              {/* Table density */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Table2 className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-300">Hustota tabulky</span>
                </div>
                <select
                  value={settings.tableDensity}
                  onChange={(e) => updateSetting('tableDensity', e.target.value as TableDensity)}
                  className="bg-[#060d1b] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/30"
                >
                  <option value="compact">Kompaktní</option>
                  <option value="normal">Normální</option>
                  <option value="comfortable">Komfortní</option>
                </select>
              </div>

              {/* Auto-focus search */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-slate-300">Auto-focus vyhledávání</span>
                </div>
                <button
                  onClick={() => updateSetting('autoFocusSearch', !settings.autoFocusSearch)}
                  className={`w-10 h-5 rounded-full transition-all relative ${settings.autoFocusSearch ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings.autoFocusSearch ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Right sidebar toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <PanelRight className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-slate-300">Pravý sidebar</span>
                </div>
                <button
                  onClick={() => updateSetting('showRightSidebar', !settings.showRightSidebar)}
                  className={`w-10 h-5 rounded-full transition-all relative ${settings.showRightSidebar ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings.showRightSidebar ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* ═══ SKLAD ═══ */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Sklad</h3>
            <div className="space-y-4">
              {/* Default block */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-teal-400" />
                  <span className="text-sm text-slate-300">Výchozí BLOCK</span>
                </div>
                <input
                  type="text"
                  value={settings.defaultBlock}
                  onChange={(e) => updateSetting('defaultBlock', e.target.value.toUpperCase())}
                  placeholder="Žádný"
                  className="w-28 bg-[#060d1b] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/30 uppercase"
                />
              </div>

              {/* Default import strategy */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Upload className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-slate-300">Strategie importu</span>
                </div>
                <select
                  value={settings.defaultImportStrategy}
                  onChange={(e) => updateSetting('defaultImportStrategy', e.target.value as any)}
                  className="bg-[#060d1b] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/30"
                >
                  <option value="skip">Přeskočit duplicity</option>
                  <option value="update">Aktualizovat</option>
                  <option value="replace">Nahradit</option>
                </select>
              </div>
            </div>
          </div>

          {/* ═══ SYSTÉM ═══ */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Systém</h3>
            <div className="space-y-3">
              <div className="bg-[#060d1b] border border-white/[0.06] rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Verze</span>
                  <span className="text-slate-300 font-mono">2.0.0</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Prostředí</span>
                  <span className="text-emerald-400 font-mono">production</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Databáze</span>
                  <span className="text-blue-400 font-mono">Supabase</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/[0.06] shrink-0">
          <button
            onClick={resetSettings}
            className="w-full glass-button text-xs py-2.5 justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Obnovit výchozí nastavení
          </button>
        </div>
      </div>
    </>
  )
}
