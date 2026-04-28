"use client"

import { useState } from "react"
import { InventoryRecord } from "../../types/app"
import { transferToSAP } from "../../actions/inventory"
import { ArrowRightLeft, Search, AlertTriangle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function TransferContent({ inventory }: { inventory: InventoryRecord[] }) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<InventoryRecord | null>(null)
  const [qty, setQty] = useState(0)
  const [uih, setUih] = useState("")
  const [notes, setNotes] = useState("Přesun do SAPu")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filtered = search.trim()
    ? inventory.filter(r => 
        r.hu_number.toLowerCase().includes(search.toLowerCase()) ||
        r.material.toLowerCase().includes(search.toLowerCase()) ||
        r.block.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 10)
    : []

  const handleSelect = (r: InventoryRecord) => {
    setSelected(r)
    setQty(r.quantity)
    setSearch("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected || !uih.trim()) return
    if (qty <= 0 || qty > selected.quantity) return

    setIsSubmitting(true)
    const res = await transferToSAP(uih.trim().toUpperCase(), selected.id, qty, notes)
    setIsSubmitting(false)

    if (res.success) {
      toast.success(res.message)
      setSelected(null)
      setQty(0)
    } else {
      toast.error(res.error || "Chyba")
    }
  }

  const remaining = selected ? selected.quantity - qty : 0
  const isFullTransfer = remaining === 0

  return (
    <div className="animate-fade-in-up max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <ArrowRightLeft className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Operace</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Přesun do SAP</h1>
        <p className="text-slate-500 mt-1 text-sm">Vyberte HU a přesuňte ji do SAP skladu.</p>
      </div>

      {!selected ? (
        <div className="glass-panel p-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              className="glass-input pl-10 text-sm"
              placeholder="Vyhledat HU, materiál nebo BLOCK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          
          {filtered.length > 0 && (
            <div className="space-y-1.5">
              {filtered.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0a1628] border border-white/[0.04] hover:border-emerald-500/20 hover:bg-emerald-500/[0.03] transition-all text-left"
                >
                  <div>
                    <span className="text-sm font-bold text-white">{r.material}</span>
                    <span className="text-xs font-mono text-blue-400 ml-3">{r.hu_number}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{r.quantity} ks</span>
                    <span className="text-xs text-slate-500 ml-2">{r.block}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {search.trim() && filtered.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-6">Žádné výsledky pro &quot;{search}&quot;</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-6">
          <div className="bg-[#0a1628] p-4 rounded-xl border border-white/[0.06] flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Materiál & HU</p>
              <p className="font-bold text-emerald-400 text-lg">{selected.material}</p>
              <p className="font-mono text-slate-400 text-sm mt-0.5">{selected.hu_number}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Na pozici</p>
              <p className="font-black text-white text-2xl">{selected.quantity} <span className="text-sm font-medium text-slate-500">ks</span></p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase">Množství k přesunu</label>
            <div className="flex items-center gap-3">
              <input type="number" min="1" max={selected.quantity} required value={qty} onChange={(e) => setQty(Number(e.target.value))} className="glass-input text-xl font-bold flex-1" />
              <button type="button" onClick={() => setQty(selected.quantity)} className="glass-button text-emerald-400 border-emerald-900/50">MAX ({selected.quantity})</button>
            </div>
          </div>

          {isFullTransfer ? (
            <div className="p-4 text-sm text-orange-200 bg-orange-950/40 border border-orange-900 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-orange-500" />
              <div>
                <p className="font-bold text-orange-400 mb-1">Úplný přesun (Archivace)</p>
                <p>Přesune se celých <strong>{qty} ks</strong>. HU bude archivována.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 text-sm text-emerald-200 bg-emerald-950/20 border border-emerald-900/50 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-bold text-emerald-400 mb-1">Částečný přesun</p>
                <p>Do SAPu se přesune <strong>{qty} ks</strong>. Na pozici zůstane <strong>{remaining} ks</strong>.</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase">Vaše UIH *</label>
            <input type="text" required value={uih} onChange={(e) => setUih(e.target.value)} className="glass-input uppercase w-1/2" />
          </div>

          <div className="flex justify-between gap-3 pt-4 border-t border-white/[0.06]">
            <button type="button" onClick={() => setSelected(null)} className="glass-button">← Zpět</button>
            <button type="submit" disabled={isSubmitting} className="glass-button-primary bg-emerald-600 hover:bg-emerald-500 border-emerald-500">
              <ArrowRightLeft className="w-5 h-5" />
              {isSubmitting ? 'Zpracovávám...' : 'Potvrdit přesun'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
