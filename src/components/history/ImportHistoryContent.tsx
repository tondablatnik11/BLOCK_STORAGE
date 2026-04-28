"use client"

import { useState, useMemo } from "react"
import { formatDateTime } from "../../lib/utils"
import { Search, FileDown, ArrowUpDown } from "lucide-react"

export default function ImportHistoryContent({ initialData }: { initialData: any[] }) {
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

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <div className="flex items-center gap-2 text-purple-400 mb-1">
          <FileDown className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Historie</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Import historie</h1>
        <p className="text-slate-500 mt-1 text-sm">Přehled všech hromadných importů z CSV a XLSX souborů.</p>
      </div>

      <div className="glass-panel p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="glass-input pl-10 py-2.5 text-sm"
            placeholder="Hledat HU, UIH, poznámku..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-xs text-slate-500 font-bold bg-[#0a1628] px-3 py-2 rounded-lg border border-white/[0.06]">
          {filtered.length} importů
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
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nová data</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Poznámka</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-slate-300">
              {filtered.map((log: any) => (
                <tr key={log.id} className="glass-table-row">
                  <td className="px-4 py-3 text-xs font-semibold text-slate-400 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                  <td className="px-4 py-3 text-sm font-black text-slate-100 uppercase whitespace-nowrap">{log.uih}</td>
                  <td className="px-4 py-3 text-xs font-mono text-purple-400 tracking-wider whitespace-nowrap">{log.hu_number}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-300 whitespace-nowrap">
                    {log.new_value ? `Qty: ${(log.new_value as any)?.quantity ?? '?'}, Bin: ${(log.new_value as any)?.bin_location ?? '?'}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-500 max-w-[200px] truncate">{log.notes || "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-600 text-sm font-bold">Žádné importy nenalezeny</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
