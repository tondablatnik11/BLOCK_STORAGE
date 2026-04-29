"use client"

import { Search, Settings } from "lucide-react"

export default function Topbar() {
  return (
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
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] rounded-lg transition-all">
          <Settings className="w-4.5 h-4.5" />
        </button>
        
        <div className="h-7 w-px bg-white/[0.08] mx-1"></div>
        
        <div className="flex items-center gap-2.5 cursor-pointer hover:bg-white/[0.04] py-1.5 px-2 rounded-lg transition-all">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-slate-200 leading-none">Skladník</span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">Admin</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-[0_0_8px_rgba(16,185,129,0.1)]">
            S
          </div>
        </div>
      </div>
    </header>
  )
}
