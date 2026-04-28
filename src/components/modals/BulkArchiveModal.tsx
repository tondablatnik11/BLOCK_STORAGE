"use client"

import { useState } from "react"
import ActionModal from "./ActionModal"
import { bulkArchiveRecords } from "../../actions/inventory"
import { Archive, AlertTriangle } from "lucide-react"

interface BulkArchiveModalProps {
  isOpen: boolean
  onClose: () => void
  selectedIds: string[]
  onSuccess: () => void
}

export default function BulkArchiveModal({ isOpen, onClose, selectedIds, onSuccess }: BulkArchiveModalProps) {
  const [uih, setUih] = useState<string>("")
  const [notes, setNotes] = useState<string>("Hromadné vymazání (Archivace)")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uih.trim() || !notes.trim()) { setError("UIH a důvod jsou povinné."); return; }
    
    setIsSubmitting(true)
    setError(null)

    const response = await bulkArchiveRecords(uih, selectedIds, notes)
    setIsSubmitting(false)

    if (response.success) {
      onSuccess() 
      onClose()
    } else {
      setError(response.error || "Neznámá chyba při hromadné archivaci.")
    }
  }

  if (!isOpen) return null

  return (
    <ActionModal isOpen={isOpen} onClose={onClose} title="Hromadná Archivace (Odstranění)" variant="red">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="p-5 bg-red-950/30 border border-red-900 rounded-xl flex items-start gap-4 text-red-200 text-sm">
          <AlertTriangle className="w-8 h-8 shrink-0 text-red-500" />
          <div>
            <p className="font-bold text-red-400 text-base mb-1">Nebezpečná operace</p>
            <p className="leading-relaxed">
              Chystáte se hromadně odepsat (archivovat) <strong>{selectedIds.length} záznamů</strong>. 
              Množství u všech vybraných HU bude vynulováno a palety nenávratně zmizí z aktivního skladu.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-200 bg-red-950 border border-red-900 rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase">Důvod archivace *</label>
          <input 
            type="text" 
            required 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            className="glass-input" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase">Admin UIH *</label>
          <input 
            type="text" 
            required 
            value={uih} 
            onChange={(e) => setUih(e.target.value)} 
            className="glass-input uppercase" 
            placeholder="Vaše identifikační číslo"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-800 mt-6">
          <button type="button" onClick={onClose} className="glass-button">
            Zrušit
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting || !uih.trim() || !notes.trim()} 
            className="glass-button-primary bg-red-600 hover:bg-red-500 border-red-500"
          >
            <Archive className="w-5 h-5" /> 
            {isSubmitting ? 'Zpracovávám...' : 'Potvrdit archivaci'}
          </button>
        </div>
      </form>
    </ActionModal>
  )
}
