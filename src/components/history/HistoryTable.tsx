"use client"

import { useState, useMemo } from "react"
import { HistoryLog, AuditAction } from "../../types/app"
import { formatDateTime } from "../../lib/utils"
import { undoHistoryAction } from "../../actions/inventory"
import { Search, Filter, History as HistoryIcon, ArrowUpDown, RotateCcw, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

const actionLabels: Record<AuditAction, { label: string, color: string }> = {
  create: { label: "Vytvoření", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  import: { label: "Import", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  update_quantity: { label: "Změna ks", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  update_bin: { label: "Změna poz", color: "text-teal-400 bg-teal-500/10 border-teal-500/30" },
  update_note: { label: "Poznámka", color: "text-slate-300 bg-slate-800 border-slate-600" },
  partial_transfer: { label: "Část. přesun", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  full_transfer: { label: "Úplný přesun", color: "text-emerald-500 bg-emerald-600/10 border-emerald-600/30" },
  archive: { label: "Archivace", color: "text-red-400 bg-red-500/10 border-red-500/30" }
}

const formatChanges = (oldVal: any, newVal: any, action: AuditAction) => {
  if (action === 'create' || action === 'import') return <span className="text-emerald-500 font-bold">Záznam vytvořen</span>
  if (action === 'archive' || action === 'full_transfer') return <span className="text-red-500 font-bold">Záznam odepsán</span>
  
  if (!oldVal || !newVal) return "-"

  const changes = []
  if (oldVal.quantity !== undefined && newVal.quantity !== undefined) {
    changes.push(`Ks: ${oldVal.quantity} ➔ ${newVal.quantity}`)
  }
  if (oldVal.bin_location !== undefined && newVal.bin_location !== undefined) {
    changes.push(`Poz: ${oldVal.bin_location} ➔ ${newVal.bin_location}`)
  }
  
  return changes.length > 0 ? changes.join(" | ") : "Změna metadat"
}

export default function HistoryTable({ initialData }: { initialData: HistoryLog[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<AuditAction | "ALL">("ALL")
  const [sortDirection, setSortDirection] = useState<'asc'|'desc'>('desc')
  const [adminUih, setAdminUih] = useState("")

  const filteredData = useMemo(() => {
    let processed = [...initialData]

    processed = processed.filter((log) => {
      const matchesSearch = 
        log.hu_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.uih.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesAction = actionFilter === "ALL" || log.action === actionFilter
      return matchesSearch && matchesAction
    })

    processed.sort((a, b) => {
      if (a.created_at < b.created_at) return sortDirection === 'asc' ? -1 : 1
      if (a.created_at > b.created_at) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return processed
  }, [initialData, searchTerm, actionFilter, sortDirection])

  const handleUndo = async (logId: string) => {
    if (!adminUih) {
      toast.error("Zadejte své Admin UIH nahoře pro potvrzení.")
      return
    }
    
    const res = await undoHistoryAction(logId, adminUih)
    if (res.success) toast.success(res.message)
    else toast.error(res.error)
  }

  return (
    <div className="space-y-4 pb-20">
      
      <div className="glass-panel p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              className="glass-input pl-10"
              placeholder="Hledat HU, UIH, poznámku..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" />
            <select
              className="glass-input py-3 cursor-pointer appearance-none min-w-[180px]"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as AuditAction | "ALL")}
            >
              <option value="ALL" className="bg-[#0A0A0A]">Všechny akce</option>
              {Object.entries(actionLabels).map(([key, config]) => (
                <option key={key} value={key} className="bg-[#0A0A0A]">{config.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto bg-[#121212] p-2 pl-4 rounded-xl border border-amber-500/20 focus-within:border-amber-500/50 transition-colors shadow-inner">
          <ShieldCheck className="text-amber-500 w-5 h-5 shrink-0" />
          <input 
            type="text" 
            placeholder="Admin UIH (pro UNDO)" 
            value={adminUih}
            onChange={(e) => setAdminUih(e.target.value.toUpperCase())}
            className="bg-transparent border-none outline-none text-sm text-amber-100 placeholder:text-slate-600 w-full sm:w-56 font-bold uppercase"
          />
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#050505] border-b border-white/10 select-none">
              <tr>
                <th onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')} className="px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-blue-400 transition-colors">
                  Čas <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-40" />
                </th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">UIH</th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">HU</th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Akce</th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Změna</th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Poznámka</th>
                <th className="px-4 py-3.5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reverze</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredData.length > 0 ? (
                filteredData.map((log) => (
                  <tr key={log.id} className="glass-table-row group">
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-400">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-black text-slate-100 uppercase">
                      {log.uih}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-blue-400 tracking-wider">
                      {log.hu_number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${actionLabels[log.action]?.color || "text-slate-400 border-slate-700 bg-[#121212]"}`}>
                        {actionLabels[log.action]?.label || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono font-bold text-slate-300">
                      {formatChanges(log.old_value, log.new_value, log.action)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-slate-500 max-w-[200px] truncate" title={log.notes || ""}>
                      {log.notes || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleUndo(log.id)}
                        className="p-1.5 text-amber-500/50 hover:text-amber-400 hover:bg-amber-500/20 rounded-md transition-all opacity-20 group-hover:opacity-100"
                        title="Vrátit tuto akci (UNDO)"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-5 bg-[#121212] rounded-2xl border border-white/5 shadow-inner">
                        <HistoryIcon className="w-10 h-10 text-slate-700" />
                      </div>
                      <p className="text-slate-500 font-bold tracking-wide mt-2">ŽÁDNÁ HISTORIE NENALEZENA</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
