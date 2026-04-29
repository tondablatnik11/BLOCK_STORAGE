"use client"

import { useState } from "react"
import { X, ClipboardCheck, CheckCircle2, AlertTriangle } from "lucide-react"
import { InventoryRecord } from "../../types/app"
import { createInventoryCheck } from "../../actions/inventoryChecks"
import { toast } from "sonner"

interface InventoryCheckModalProps {
  isOpen: boolean
  onClose: () => void
  record: InventoryRecord | null
}

export default function InventoryCheckModal({ isOpen, onClose, record }: InventoryCheckModalProps) {
  const [countedQty, setCountedQty] = useState(0)
  const [uih, setUih] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpen = () => {
    if (record) {
      setCountedQty(record.quantity)
      setNotes("")
      setError(null)
    }
  }

  // Reset on open
  if (isOpen && record && countedQty === 0 && !error) {
    handleOpen()
  }

  if (!isOpen || !record) return null

  const result = record.quantity === countedQty ? 'OK' : 'NOK'
  const isNok = result === 'NOK'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uih.trim()) { setError("UIH je povinné."); return }
    if (countedQty < 0) { setError("Množství nemůže být záporné."); return }
    if (isNok && !notes.trim()) { setError("U NOK inventury je povinná poznámka."); return }

    setSubmitting(true)
    setError(null)

    const res = await createInventoryCheck(
      record.id,
      record.hu_number,
      record.block,
      record.material,
      record.bin_location,
      record.quantity,
      countedQty,
      uih,
      notes || null
    )

    setSubmitting(false)

    if (res.success) {
      toast.success(res.message)
      onClose()
    } else {
      setError(res.error || "Chyba")
      toast.error("Inventura selhala.")
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-[#0a1628] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/15 rounded-xl">
                  <ClipboardCheck className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Inventura HU</h2>
                  <p className="text-xs text-slate-500 font-mono">{record.hu_number}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Record info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#060d1b] border border-white/[0.06] rounded-xl p-3">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">BLOCK</p>
                <p className="text-sm font-bold text-slate-200">{record.block}</p>
              </div>
              <div className="bg-[#060d1b] border border-white/[0.06] rounded-xl p-3">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">Materiál</p>
                <p className="text-sm font-bold text-slate-200 truncate">{record.material}</p>
              </div>
            </div>

            {/* System quantity */}
            <div className="bg-[#060d1b] border border-white/[0.06] rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Systémové množství</p>
                <p className="text-2xl font-black text-white">{record.quantity} <span className="text-sm font-medium text-slate-500">ks</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Pozice</p>
                <p className="text-sm font-mono text-slate-400">{record.bin_location}</p>
              </div>
            </div>

            {/* Counted quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Fyzicky spočítané množství *</label>
              <input
                type="number"
                min="0"
                required
                value={countedQty}
                onChange={(e) => setCountedQty(Number(e.target.value))}
                className="glass-input text-xl font-bold"
              />
            </div>

            {/* Result preview */}
            {isNok ? (
              <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-400">NOK — Rozdíl: {Math.abs(record.quantity - countedQty)} ks</p>
                  <p className="text-xs text-red-300/70 mt-0.5">Systém: {record.quantity} ks → Spočítáno: {countedQty} ks</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <p className="text-sm font-bold text-emerald-400">OK — Množství souhlasí</p>
              </div>
            )}

            {/* Notes (required for NOK) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">
                Poznámka {isNok && <span className="text-red-400">*</span>}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isNok ? "Povinné u NOK — uveďte důvod rozdílu" : "Volitelná poznámka"}
                rows={2}
                required={isNok}
                className="w-full bg-[#060d1b] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none"
              />
            </div>

            {/* UIH */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Vaše UIH *</label>
              <input
                type="text"
                required
                value={uih}
                onChange={(e) => setUih(e.target.value)}
                className="glass-input uppercase"
                placeholder="Např. UIH001"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-200 bg-red-950/40 border border-red-900 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="glass-button">Zrušit</button>
              <button
                type="submit"
                disabled={submitting}
                className={`glass-button-primary border-transparent ${isNok ? 'bg-red-600 hover:bg-red-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
              >
                <ClipboardCheck className="w-4 h-4" />
                {submitting ? 'Ukládám...' : 'Uložit inventuru'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
