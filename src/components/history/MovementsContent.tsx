"use client"

import { useState, useMemo } from "react"
import { formatDateTime } from "../../lib/utils"
import { Search, GitBranch, ArrowUpDown } from "lucide-react"

const actionLabels: Record<string, { label: string; color: string }> = {
  partial_transfer: { label: "Částečný přesun", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  full_transfer: { label: "Úplný přesun", color: "text-emerald-500 bg-emerald-600/10 border-emerald-600/30" },
  update_bin: { label: "Změna pozice", color: "text-teal-400 bg-teal-500/10 border-teal-500/30" },
  update_quantity: { label: "Změna množství", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
}

export default function MovementsContent({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("")
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')

  const filtered = useMemo(() => {
    let data = [...initialData]
    if (search.trim()) {
      const term = search.toLowerCase()
      data = data.filter(l => 
        l.hu_number?.toLowerCase().includes(term) ||
        l.uih?.toLowerCase().includes(term) ||
        l.notes?.toLowerCase().includes(term)
      )
    }
    data.sort((a, b) => {
      if (a.created_at < b.created_at) return sortDir === 'asc' ? -1 : 1
      if (a.created_at > b.created_at) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return data
  }, [initialData, search, sortDir])

  const formatChanges = (oldVal: any, newVal: any) => {
    if (!oldVal && !newVal) return "—"
    const changes: string[] = []
    if (oldVal?.quantity !== undefined && newVal?.quantity !== undefined) {
      changes.push(`${oldVal.quantity} → ${newVal.quantity} ks`)
    }
    if (oldVal?.bin_location && newVal?.bin_location) {
      changes.push(`${oldVal.bin_location} → ${newVal.bin_location}`)
    }
    return changes.length > 0 ? changes.join(" | ") : "Pohyb"
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <div className="flex items-center gap-2 text-teal-400 mb-1">
          <GitBranch className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Historie</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Pohyby HU</h1>
        <p className="text-slate-500 mt-1 text-sm">Všechny fyzické přesuny, změny pozic a množství.</p>
      </div>

      <div className="glass-panel p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="glass-input pl-10 py-2.5 text-sm"
            placeholder="Hledat HU, UIH..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-xs text-slate-500 font-bold bg-[#0a1628] px-3 py-2 rounded-lg border border-white/[0.06]">
          {filtered.length} pohybů
        </span>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#060d1b] border-b border-white/[0.08]">
              <tr>
                <th onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-blue-400 transition-colors">
                  Čas <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-30" />
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">UIH</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">HU</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Typ</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Změna</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Poznámka</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-slate-300">
              {filtered.map((log: any) => {
                const config = actionLabels[log.action] || { label: log.action, color: "text-slate-400 bg-slate-800 border-slate-700" }
                return (
                  <tr key={log.id} className="glass-table-row">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-400 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                    <td className="px-4 py-3 text-sm font-black text-slate-100 uppercase whitespace-nowrap">{log.uih}</td>
                    <td className="px-4 py-3 text-xs font-mono text-blue-400 tracking-wider whitespace-nowrap">{log.hu_number}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${config.color}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-300 whitespace-nowrap">{formatChanges(log.old_value, log.new_value)}</td>
                    <td className="px-4 py-3 text-[13px] text-slate-500 max-w-[200px] truncate">{log.notes || "—"}</td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-600 text-sm font-bold">Žádné pohyby nenalezeny</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
