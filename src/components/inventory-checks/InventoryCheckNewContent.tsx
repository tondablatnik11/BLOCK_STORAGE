"use client"

import { useState, useMemo } from "react"
import { ClipboardCheck, Search, CheckCircle2, AlertTriangle, Package, Send, ArrowLeft, Layers } from "lucide-react"
import { InventoryRecord } from "../../types/app"
import { createInventoryCheck, createBlockInventoryCheckBatch } from "../../actions/inventoryChecks"
import { toast } from "sonner"
import Link from "next/link"

interface Props {
  inventory: InventoryRecord[]
}

type Mode = 'select' | 'single' | 'block'

interface BlockCheckRow {
  record: InventoryRecord
  countedQty: number
  notes: string
}

export default function InventoryCheckNewContent({ inventory }: Props) {
  const [mode, setMode] = useState<Mode>('select')
  const [search, setSearch] = useState("")
  const [selectedBlock, setSelectedBlock] = useState("")
  const [uih, setUih] = useState("")

  // Single HU mode
  const [selectedHU, setSelectedHU] = useState<InventoryRecord | null>(null)
  const [countedQty, setCountedQty] = useState(0)
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Block mode
  const [blockRows, setBlockRows] = useState<BlockCheckRow[]>([])
  const [batchNotes, setBatchNotes] = useState("")

  // Unique blocks
  const uniqueBlocks = useMemo(() => {
    const blocks = new Set(inventory.map(r => r.block))
    return Array.from(blocks).sort()
  }, [inventory])

  // Search filtered
  const filtered = useMemo(() => {
    if (!search.trim()) return []
    const term = search.toLowerCase()
    return inventory.filter(r =>
      r.hu_number.toLowerCase().includes(term) ||
      r.material.toLowerCase().includes(term) ||
      r.block.toLowerCase().includes(term)
    ).slice(0, 20)
  }, [search, inventory])

  // Block items
  const blockItems = useMemo(() => {
    if (!selectedBlock) return []
    return inventory.filter(r => r.block === selectedBlock)
  }, [selectedBlock, inventory])

  // Initialize block rows when block selected
  const handleSelectBlock = (block: string) => {
    setSelectedBlock(block)
    const items = inventory.filter(r => r.block === block)
    setBlockRows(items.map(r => ({ record: r, countedQty: r.quantity, notes: "" })))
    setMode('block')
  }

  // Single HU select
  const handleSelectHU = (record: InventoryRecord) => {
    setSelectedHU(record)
    setCountedQty(record.quantity)
    setNotes("")
    setSearch("")
    setMode('single')
  }

  // Submit single check
  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHU || !uih.trim()) return

    setSubmitting(true)
    const res = await createInventoryCheck(
      selectedHU.id, selectedHU.hu_number, selectedHU.block,
      selectedHU.material, selectedHU.bin_location,
      selectedHU.quantity, countedQty, uih, notes || null
    )
    setSubmitting(false)

    if (res.success) {
      toast.success(res.message)
      setMode('select')
      setSelectedHU(null)
    } else {
      toast.error(res.error || "Chyba")
    }
  }

  // Submit block batch
  const handleSubmitBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uih.trim() || blockRows.length === 0) return

    setSubmitting(true)
    const items = blockRows.map(row => ({
      inventoryId: row.record.id,
      huNumber: row.record.hu_number,
      material: row.record.material,
      binLocation: row.record.bin_location,
      systemQuantity: row.record.quantity,
      countedQuantity: row.countedQty,
      notes: row.notes || null,
    }))

    const res = await createBlockInventoryCheckBatch(selectedBlock, uih, items, batchNotes || null)
    setSubmitting(false)

    if (res.success) {
      toast.success(res.message)
      setMode('select')
      setSelectedBlock("")
      setBlockRows([])
    } else {
      toast.error(res.error || "Chyba")
    }
  }

  const updateBlockRow = (index: number, field: 'countedQty' | 'notes', value: any) => {
    setBlockRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row))
  }

  const singleResult = selectedHU ? (selectedHU.quantity === countedQty ? 'OK' : 'NOK') : null

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-2 bg-cyan-500/15 rounded-xl">
          <ClipboardCheck className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Zadat inventuru</h1>
          <p className="text-slate-500 text-sm">Fyzická kontrola skladových zásob — jednotlivá HU nebo celý BLOCK.</p>
        </div>
      </div>

      {/* Mode selection */}
      {mode === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Single HU */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Jednotlivá HU</h3>
            </div>
            <p className="text-xs text-slate-500">Vyhledejte a zkontrolujte jednu konkrétní HU.</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Vyhledat HU, materiál..."
                className="glass-input pl-10"
              />
            </div>
            {filtered.length > 0 && (
              <div className="max-h-[200px] overflow-y-auto custom-scrollbar space-y-1">
                {filtered.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectHU(r)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-blue-400">{r.hu_number}</span>
                      <span className="text-[10px] text-slate-600">{r.block}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{r.material} · {r.quantity} ks</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Block check */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Celý BLOCK</h3>
            </div>
            <p className="text-xs text-slate-500">Zkontrolujte všechny HU v jednom bloku najednou.</p>
            <select
              value={selectedBlock}
              onChange={(e) => e.target.value && handleSelectBlock(e.target.value)}
              className="glass-input"
            >
              <option value="">Vyberte BLOCK...</option>
              {uniqueBlocks.map(b => {
                const count = inventory.filter(r => r.block === b).length
                return <option key={b} value={b}>{b} ({count} HU)</option>
              })}
            </select>
          </div>
        </div>
      )}

      {/* Single HU form */}
      {mode === 'single' && selectedHU && (
        <form onSubmit={handleSubmitSingle} className="glass-panel p-6 space-y-5 max-w-lg">
          <button type="button" onClick={() => setMode('select')} className="text-xs text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Zpět na výběr
          </button>

          <div className="bg-[#060d1b] border border-white/[0.06] rounded-xl p-4">
            <p className="text-xs font-mono text-blue-400">{selectedHU.hu_number}</p>
            <p className="text-sm font-bold text-white mt-1">{selectedHU.material}</p>
            <div className="flex gap-4 text-[11px] text-slate-500 mt-2">
              <span>{selectedHU.block}</span>
              <span>{selectedHU.bin_location}</span>
              <span className="ml-auto font-bold text-white">{selectedHU.quantity} ks (systém)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase">Fyzicky spočítané množství *</label>
            <input type="number" min="0" required value={countedQty} onChange={(e) => setCountedQty(Number(e.target.value))} className="glass-input text-xl font-bold" />
          </div>

          {singleResult === 'NOK' ? (
            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-400">NOK — Rozdíl: {Math.abs(selectedHU.quantity - countedQty)} ks</p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <p className="text-sm font-bold text-emerald-400">OK — Množství souhlasí</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase">
              Poznámka {singleResult === 'NOK' && <span className="text-red-400">*</span>}
            </label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} required={singleResult === 'NOK'} placeholder={singleResult === 'NOK' ? "Povinné — uveďte důvod" : "Volitelná"} className="w-full bg-[#060d1b] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase">Vaše UIH *</label>
            <input type="text" required value={uih} onChange={(e) => setUih(e.target.value)} className="glass-input uppercase" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setMode('select')} className="glass-button">Zrušit</button>
            <button type="submit" disabled={submitting} className={`glass-button-primary border-transparent ${singleResult === 'NOK' ? 'bg-red-600 hover:bg-red-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}>
              <ClipboardCheck className="w-4 h-4" />
              {submitting ? 'Ukládám...' : 'Uložit inventuru'}
            </button>
          </div>
        </form>
      )}

      {/* Block check form */}
      {mode === 'block' && blockRows.length > 0 && (
        <form onSubmit={handleSubmitBlock} className="space-y-5">
          <button type="button" onClick={() => setMode('select')} className="text-xs text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Zpět na výběr
          </button>

          <div className="glass-panel p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">{selectedBlock}</h3>
              <p className="text-xs text-slate-500">{blockRows.length} HU k inventuře</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-emerald-400 font-bold">
                {blockRows.filter(r => r.record.quantity === r.countedQty).length} OK
              </span>
              <span className="text-red-400 font-bold">
                {blockRows.filter(r => r.record.quantity !== r.countedQty).length} NOK
              </span>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#060d1b] border-b border-white/[0.08]">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">HU</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Materiál</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Systém</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Spočítáno</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Stav</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Poznámka</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {blockRows.map((row, i) => {
                    const isNok = row.record.quantity !== row.countedQty
                    return (
                      <tr key={row.record.id} className={`${isNok ? 'bg-red-950/10' : ''}`}>
                        <td className="px-4 py-2 text-xs font-mono text-blue-400">{row.record.hu_number.slice(-10)}</td>
                        <td className="px-4 py-2 text-xs text-slate-300 truncate max-w-[150px]">{row.record.material}</td>
                        <td className="px-4 py-2 text-sm font-bold text-white">{row.record.quantity}</td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            value={row.countedQty}
                            onChange={(e) => updateBlockRow(i, 'countedQty', Number(e.target.value))}
                            className="w-20 bg-[#060d1b] border border-white/[0.08] rounded-lg px-2 py-1 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/30"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isNok ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {isNok ? 'NOK' : 'OK'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={row.notes}
                            onChange={(e) => updateBlockRow(i, 'notes', e.target.value)}
                            placeholder={isNok ? "Povinné u NOK" : ""}
                            required={isNok}
                            className="w-full bg-[#060d1b] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Vaše UIH *</label>
              <input type="text" required value={uih} onChange={(e) => setUih(e.target.value)} className="glass-input uppercase" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Poznámka k dávce</label>
              <input type="text" value={batchNotes} onChange={(e) => setBatchNotes(e.target.value)} placeholder="Volitelná poznámka" className="glass-input" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setMode('select')} className="glass-button">Zrušit</button>
            <button type="submit" disabled={submitting} className="glass-button-primary border-transparent bg-cyan-600 hover:bg-cyan-500">
              <Send className="w-4 h-4" />
              {submitting ? 'Ukládám...' : `Uložit inventuru (${blockRows.length} HU)`}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
