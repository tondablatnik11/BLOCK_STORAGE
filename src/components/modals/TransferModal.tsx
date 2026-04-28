"use client"

import { useState, useEffect } from "react"
import ActionModal from "./ActionModal"
import { InventoryRecord } from "../../types/app"
import { transferToSAP } from "../../actions/inventory"
import { ArrowRightLeft, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  record: InventoryRecord | null
}

export default function TransferModal({ isOpen, onClose, record }: TransferModalProps) {
  const [transferQuantity, setTransferQuantity] = useState<number>(0)
  const [uih, setUih] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (record && isOpen) {
      setTransferQuantity(record.quantity)
      setNotes("Přesun do SAPu")
      setError(null)
    }
  }, [record, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!record) return

    if (!uih.trim()) { setError("UIH je povinné."); return }
    if (transferQuantity <= 0 || transferQuantity > record.quantity) {
      setError("Zadáno neplatné množství k přesunu.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const response = await transferToSAP(uih.trim().toUpperCase(), record.id, transferQuantity, notes)

    setIsSubmitting(false)

    if (response.success) {
      toast.success(response.message)
      onClose()
    } else {
      setError(response.error || "Došlo k neznámé chybě.")
      toast.error("Přesun selhal.")
    }
  }

  if (!record) return null

  const remaining = record.quantity - transferQuantity
  const isFullTransfer = remaining === 0

  return (
    <ActionModal isOpen={isOpen} onClose={onClose} title="Přesun do SAP skladu" variant="green">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Súhrn HU */}
        <div className="bg-[#111827] p-4 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Materiál & HU</p>
            <p className="font-bold text-emerald-400 text-lg">{record.material}</p>
            <p className="font-mono text-slate-400 text-sm mt-0.5">{record.hu_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Na pozici</p>
            <p className="font-black text-white text-2xl">{record.quantity} <span className="text-sm font-medium text-slate-500">ks</span></p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-200 bg-red-950/40 border border-red-900 rounded-xl">
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase">Množství k přesunu</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max={record.quantity}
              required
              value={transferQuantity}
              onChange={(e) => setTransferQuantity(Number(e.target.value))}
              className="glass-input text-xl font-bold flex-1"
            />
            <button
              type="button"
              onClick={() => setTransferQuantity(record.quantity)}
              className="glass-button bg-[#111827] text-emerald-400 border-emerald-900/50 hover:bg-[#1F2937]"
            >
              MAX ({record.quantity})
            </button>
          </div>
        </div>

        {/* PREVIEW VÝSLEDKU */}
        {isFullTransfer ? (
          <div className="p-4 text-sm text-orange-200 bg-orange-950/40 border border-orange-900 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-orange-500 mt-0.5" />
            <div>
              <p className="font-bold text-orange-400 mb-1">Úplný přesun (Archivace)</p>
              <p>Přesune se celých <strong>{transferQuantity} ks</strong>. Skladová jednotka bude na tomto bloku uzavřena a archivována.</p>
            </div>
          </div>
        ) : (
          <div className="p-4 text-sm text-emerald-200 bg-emerald-950/20 border border-emerald-900/50 rounded-xl flex items-start gap-3">
            <ArrowRightLeft className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-400 mb-1">Částečný přesun</p>
              <p>Do SAPu se přesune <strong>{transferQuantity} ks</strong>. Na fyzické pozici v aplikaci zůstane <strong>{remaining} ks</strong>.</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase">Vaše UIH *</label>
          <input
            type="text"
            required
            value={uih}
            onChange={(e) => setUih(e.target.value)}
            className="glass-input uppercase"
          />
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="glass-button">Zrušit</button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`glass-button-primary border-transparent ${isFullTransfer ? 'bg-orange-600 hover:bg-orange-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
          >
            <ArrowRightLeft className="w-5 h-5" />
            {isSubmitting ? 'Zpracovávám...' : 'Potvrdit přesun'}
          </button>
        </div>
      </form>
    </ActionModal>
  )
}
