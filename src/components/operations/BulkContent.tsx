"use client"

import { useState, useMemo } from "react"
import { InventoryRecord } from "../../types/app"
import { bulkArchiveRecords } from "../../actions/inventory"
import { Layers, Search, Archive, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function BulkContent({ inventory }: { inventory: InventoryRecord[] }) {
  const [search, setSearch] = useState("")
  const [filterBlock, setFilterBlock] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [uih, setUih] = useState("")
  const [notes, setNotes] = useState("Hromadná archivace")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const uniqueBlocks = useMemo(() => [...new Set(inventory.map(r => r.block))].sort(), [inventory])

  const filtered = useMemo(() => {
    let data = [...inventory]
    if (filterBlock) data = data.filter(r => r.block === filterBlock)
    if (search.trim()) {
      const term = search.toLowerCase()
      data = data.filter(r => 
        r.hu_number.toLowerCase().includes(term) ||
        r.material.toLowerCase().includes(term)
      )
    }
    return data
  }, [inventory, search, filterBlock])

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(r => r.id)))
    }
  }

  const toggle = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleArchive = async () => {
    if (!uih.trim() || selectedIds.size === 0) return
    setIsSubmitting(true)
    const res = await bulkArchiveRecords(uih.trim().toUpperCase(), Array.from(selectedIds), notes)
    setIsSubmitting(false)
    if (res.success) {
      toast.success(res.message)
      setSelectedIds(new Set())
    } else {
      toast.error(res.error || "Chyba")
    }
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <div className="flex items-center gap-2 text-amber-400 mb-1">
          <Layers className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Operace</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Hromadné akce</h1>
        <p className="text-slate-500 mt-1 text-sm">Vyberte více záznamů a proveďte hromadnou operaci.</p>
      </div>

      <div className="glass-panel p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input type="text" className="glass-input pl-10 py-2.5 text-sm" placeholder="Hledat..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={filterBlock} onChange={(e) => setFilterBlock(e.target.value)} className="glass-input py-2.5 text-sm w-full md:w-40">
          <option value="" className="bg-[#0a1628]">Všechny bloky</option>
          {uniqueBlocks.map(b => <option key={b} value={b} className="bg-[#0a1628]">{b}</option>)}
        </select>
        <button onClick={toggleAll} className="glass-button text-xs py-2">
          {selectedIds.size === filtered.length ? 'Odznačit vše' : 'Vybrat vše'}
        </button>
        <span className="text-xs text-slate-500 font-bold">
          Vybráno: <span className="text-blue-400">{selectedIds.size}</span> / {filtered.length}
        </span>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="min-w-full text-left">
            <thead className="bg-[#060d1b] border-b border-white/[0.08] sticky top-0">
              <tr>
                <th className="px-4 py-3 w-10 text-center"><input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="w-4 h-4 accent-blue-500 cursor-pointer" /></th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">BLOCK</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Materiál</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">HU</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Množství</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pozice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.map(r => (
                <tr key={r.id} className={`glass-table-row cursor-pointer ${selectedIds.has(r.id) ? 'bg-blue-600/[0.08]' : ''}`} onClick={() => toggle(r.id)}>
                  <td className="px-4 py-2.5 text-center"><input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggle(r.id)} className="w-4 h-4 accent-blue-500 cursor-pointer" /></td>
                  <td className="px-4 py-2.5 text-[13px] font-bold text-slate-400">{r.block}</td>
                  <td className="px-4 py-2.5 text-sm font-black text-white">{r.material}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-blue-400">{r.hu_number}</td>
                  <td className="px-4 py-2.5 text-sm font-bold text-white">{r.quantity} ks</td>
                  <td className="px-4 py-2.5 text-[13px] font-mono text-slate-400">{r.bin_location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="glass-panel p-5 border-red-500/20">
          <div className="flex items-start gap-4 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-400">Hromadná archivace — {selectedIds.size} záznamů</p>
              <p className="text-xs text-slate-500 mt-1">Vybrané HU budou vynulovány a přesunuty do archivu.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Důvod archivace *</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="glass-input" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Admin UIH *</label>
              <input type="text" value={uih} onChange={(e) => setUih(e.target.value)} className="glass-input uppercase" placeholder="Vaše UIH" />
            </div>
          </div>
          <button
            onClick={handleArchive}
            disabled={isSubmitting || !uih.trim() || !notes.trim()}
            className="bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 transition-all font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Archive className="w-4 h-4" />
            {isSubmitting ? 'Zpracovávám...' : 'Potvrdit hromadnou archivaci'}
          </button>
        </div>
      )}
    </div>
  )
}
