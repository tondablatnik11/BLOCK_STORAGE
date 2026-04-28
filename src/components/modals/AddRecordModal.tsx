"use client"

import { useState } from "react"
import ActionModal from "./ActionModal"
import { addInventoryRecord } from "../../actions/inventory"
import { PackagePlus, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface AddRecordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddRecordModal({ isOpen, onClose }: AddRecordModalProps) {
  const [block, setBlock] = useState("")
  const [material, setMaterial] = useState("")
  const [huNumber, setHuNumber] = useState("")
  const [quantity, setQuantity] = useState<number>(0)
  const [binLocation, setBinLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [uih, setUih] = useState("")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setBlock(""); setMaterial(""); setHuNumber(""); setQuantity(0); setBinLocation(""); setNotes(""); setUih("")
      onClose()
    } else {
      setError(response.error || "Došlo k neznámé chybě.")
      toast.error("Přidání se nezdařilo.")
    }
  }

  if (!isOpen) return null

  return (
    <ActionModal isOpen={isOpen} onClose={onClose} title="Nová Skladová Jednotka" variant="blue">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {error && (
          <div className="p-4 text-sm text-red-200 bg-red-950/40 border border-red-900 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p>{error}</p>
          </div>
        )}

        {/* Sekce 1: Identifikace */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">1. Identifikace</h3>
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

        {/* Sekce 2: Skladování */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">2. Skladování</h3>
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

        {/* Sekce 3: Audit */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">3. Ověření</h3>
          <div className="space-y-1.5 w-1/2">
            <label className="text-xs font-semibold text-slate-400 uppercase">Vaše UIH *</label>
            <input type="text" required value={uih} onChange={(e) => setUih(e.target.value)} placeholder="UIH..." className="glass-input uppercase" />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="glass-button">Zrušit</button>
          <button type="submit" disabled={isSubmitting} className="glass-button-primary">
            <PackagePlus className="w-5 h-5" />
            {isSubmitting ? 'Ukládám...' : 'Uložit záznam'}
          </button>
        </div>
      </form>
    </ActionModal>
  )
}
