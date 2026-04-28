"use client"

import { useState } from "react"
import { addInventoryRecord } from "../../actions/inventory"
import { PackagePlus, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function AddPage() {
  const [block, setBlock] = useState("")
  const [material, setMaterial] = useState("")
  const [huNumber, setHuNumber] = useState("")
  const [quantity, setQuantity] = useState<number>(0)
  const [binLocation, setBinLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [uih, setUih] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uih.trim()) { setError("UIH je povinné."); return }
    
    const blockFormatted = block.trim().toUpperCase()
    if (!/^BLOCK-(0[1-9]|[1-2][0-9]|30)$/.test(blockFormatted)) {
      setError("BLOCK musí být ve formátu BLOCK-01 až BLOCK-30.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const response = await addInventoryRecord(
      uih.trim().toUpperCase(),
      blockFormatted,
      material.trim().toUpperCase(),
      huNumber.trim(),
      quantity,
      binLocation.trim().toUpperCase(),
      notes.trim() || undefined
    )

    setIsSubmitting(false)

    if (response.success) {
      toast.success(response.message)
      setSuccess(true)
      setBlock(""); setMaterial(""); setHuNumber(""); setQuantity(0); setBinLocation(""); setNotes("")
    } else {
      setError(response.error || "Došlo k neznámé chybě.")
      toast.error("Přidání se nezdařilo.")
    }
  }

  return (
    <div className="animate-fade-in-up max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-blue-400 mb-1">
          <PackagePlus className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Sklad</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Přidat záznam</h1>
        <p className="text-slate-500 mt-1 text-sm">Vytvořte novou skladovou jednotku (HU) na externím bloku.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-6">
        {error && (
          <div className="p-4 text-sm text-red-200 bg-red-950/40 border border-red-900 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 text-sm text-emerald-200 bg-emerald-950/40 border border-emerald-900 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            <p>Záznam úspěšně přidán! Můžete přidat další.</p>
          </div>
        )}

        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/[0.06] pb-2">1. Identifikace</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Materiál *</label>
              <input type="text" required value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Kód materiálu" className="glass-input uppercase text-blue-100 font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Číslo HU *</label>
              <input type="text" required value={huNumber} onChange={(e) => setHuNumber(e.target.value)} placeholder="18-20 číslic" className="glass-input font-mono" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/[0.06] pb-2">2. Skladování</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">BLOCK *</label>
              <input type="text" required value={block} onChange={(e) => setBlock(e.target.value)} placeholder="BLOCK-01" className="glass-input uppercase" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Pozice *</label>
              <input type="text" required value={binLocation} onChange={(e) => setBinLocation(e.target.value)} placeholder="xx-xx-xx-xx" className="glass-input uppercase" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Kusy *</label>
              <input type="number" min="0" required value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="glass-input font-bold" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Poznámka</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Volitelná poznámka" className="glass-input" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/[0.06] pb-2">3. Ověření</h3>
          <div className="space-y-1.5 w-1/2">
            <label className="text-xs font-semibold text-slate-400 uppercase">Vaše UIH *</label>
            <input type="text" required value={uih} onChange={(e) => setUih(e.target.value)} placeholder="UIH..." className="glass-input uppercase" />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="submit" disabled={isSubmitting} className="glass-button-primary">
            <PackagePlus className="w-5 h-5" />
            {isSubmitting ? 'Ukládám...' : 'Uložit záznam'}
          </button>
        </div>
      </form>
    </div>
  )
}
