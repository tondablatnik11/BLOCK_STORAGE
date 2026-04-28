"use client"

import { useState, useEffect } from "react"
import ActionModal from "./ActionModal"
import { InventoryRecord } from "../../types/app"
import { updateInventoryRecord } from "../../actions/inventory"
import { Save, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface EditRecordModalProps {
  isOpen: boolean
  onClose: () => void
  record: InventoryRecord | null
}

export default function EditRecordModal({ isOpen, onClose, record }: EditRecordModalProps) {
  const [quantity, setQuantity] = useState<number>(0)
  const [binLocation, setBinLocation] = useState<string>("")
  const [uih, setUih] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (record && isOpen) {
      setQuantity(record.quantity)
      setBinLocation(record.bin_location)
      setNotes("")
      setError(null)
    }
  }, [record, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!record) return
    if (!uih.trim()) { setError("UIH je povinné."); return }
    if (!notes.trim()) { setError("Důvod úpravy je povinný."); return }

    setIsSubmitting(true)
    setError(null)

    const response = await updateInventoryRecord(uih.trim().toUpperCase(), record.id, quantity, binLocation.trim().toUpperCase(), notes)

    setIsSubmitting(false)

    if (response.success) {
      toast.success(response.message)
      onClose()
    } else {
      setError(response.error || "Chyba při ukládání.")
      toast.error("Změny se nepodařilo uložit.")
    }
  }

  if (!record) return null

  return (
    <ActionModal isOpen={isOpen} onClose={onClose} title="Úprava záznamu">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase">HU:</span>
            <span className="font-mono text-white text-sm">{record.hu_number}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase">Materiál:</span>
            <span className="font-bold text-blue-400">{record.material}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-white uppercase tracking-wide">Nové množství</label>
            <input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="glass-input font-bold text-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-white uppercase tracking-wide">Nová pozice</label>
            <input
              type="text"
              required
              value={binLocation}
              onChange={(e) => setBinLocation(e.target.value)}
              className="glass-input uppercase"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-white uppercase tracking-wide">Důvod úpravy *</label>
          <textarea
            required
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Např. oprava po inventuře..."
            className="glass-input resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-white uppercase tracking-wide">Vaše UIH *</label>
          <input
            type="text"
            required
            value={uih}
            onChange={(e) => setUih(e.target.value)}
            placeholder="Potvrďte svým UIH"
            className="glass-input uppercase w-1/2"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            Zrušit
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="glass-button-primary"
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? 'Ukládám...' : 'Uložit změny'}
          </button>
        </div>
      </form>
    </ActionModal>
  )
}
