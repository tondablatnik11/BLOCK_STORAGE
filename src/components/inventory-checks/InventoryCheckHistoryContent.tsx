"use client"

import { useState } from "react"
import { ClipboardList, Search, CheckCircle2, AlertTriangle, Filter, X } from "lucide-react"
import { InventoryCheck, getInventoryCheckHistory } from "../../actions/inventoryChecks"

interface Props {
  initialChecks: InventoryCheck[]
}

export default function InventoryCheckHistoryContent({ initialChecks }: Props) {
  const [checks, setChecks] = useState<InventoryCheck[]>(initialChecks)
  const [filterBlock, setFilterBlock] = useState("")
  const [filterMaterial, setFilterMaterial] = useState("")
  const [filterHU, setFilterHU] = useState("")
  const [filterResult, setFilterResult] = useState("")
  const [loading, setLoading] = useState(false)

  const handleFilter = async () => {
    setLoading(true)
    const data = await getInventoryCheckHistory({
      block: filterBlock || undefined,
      material: filterMaterial || undefined,
      huNumber: filterHU || undefined,
      result: filterResult || undefined,
    })
    setChecks(data)
    setLoading(false)
  }

  const clearFilters = () => {
    setFilterBlock("")
    setFilterMaterial("")
    setFilterHU("")
    setFilterResult("")
    setChecks(initialChecks)
  }

  const hasFilters = filterBlock || filterMaterial || filterHU || filterResult

  const formatDate = (d: string) => new Date(d).toLocaleString('cs-CZ', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-2 bg-purple-500/15 rounded-xl">
          <ClipboardList className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Historie inventur</h1>
          <p className="text-slate-500 text-sm">{checks.length} záznamů</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500" />
          <input value={filterBlock} onChange={(e) => setFilterBlock(e.target.value)} placeholder="BLOCK" className="glass-input text-xs py-1.5 w-28" />
          <input value={filterMaterial} onChange={(e) => setFilterMaterial(e.target.value)} placeholder="Materiál" className="glass-input text-xs py-1.5 w-36" />
          <input value={filterHU} onChange={(e) => setFilterHU(e.target.value)} placeholder="HU" className="glass-input text-xs py-1.5 w-36" />
          <select value={filterResult} onChange={(e) => setFilterResult(e.target.value)} className="glass-input text-xs py-1.5 w-24">
            <option value="">Vše</option>
            <option value="OK">OK</option>
            <option value="NOK">NOK</option>
          </select>
          <button onClick={handleFilter} disabled={loading} className="glass-button-primary text-xs py-1.5 px-3">
            <Search className="w-3.5 h-3.5" />
            {loading ? 'Hledám...' : 'Filtrovat'}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
              <X className="w-3 h-3" /> Vymazat
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#060d1b] border-b border-white/[0.08]">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Stav</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">HU</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">BLOCK</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Materiál</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Systém</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Spočítáno</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rozdíl</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">UIH</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Datum</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Poznámka</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-slate-300">
              {checks.length > 0 ? checks.map((check) => {
                const diff = check.counted_quantity - check.system_quantity
                return (
                  <tr key={check.id} className="glass-table-row">
                    <td className="px-4 py-2.5 text-center">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        check.result === 'OK'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {check.result}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-mono text-blue-400">{check.hu_number.slice(-12)}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-400 font-bold">{check.block}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-300 truncate max-w-[150px]">{check.material}</td>
                    <td className="px-4 py-2.5 text-sm font-bold text-white">{check.system_quantity}</td>
                    <td className="px-4 py-2.5 text-sm font-bold text-white">{check.counted_quantity}</td>
                    <td className="px-4 py-2.5 text-sm font-bold">
                      {diff === 0 ? (
                        <span className="text-slate-600">0</span>
                      ) : (
                        <span className={diff > 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {diff > 0 ? '+' : ''}{diff}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{check.checked_by_uih}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">{formatDate(check.checked_at)}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 truncate max-w-[150px]">{check.notes || "—"}</td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center text-slate-600 text-sm">
                    Žádné inventurní záznamy
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
