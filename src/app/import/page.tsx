"use client"

import { useState } from "react"
import { processImport } from "../../actions/import"
import { ImportResult } from "../../types/app"
import { Upload, FileText, AlertCircle, CheckCircle2, Info } from "lucide-react"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uih, setUih] = useState<string>("")
  const [forceBlock, setForceBlock] = useState<string>("")
  const [strategy, setStrategy] = useState<"skip" | "overwrite">("skip")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !uih.trim()) return

    setIsSubmitting(true)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("uih", uih)
    formData.append("duplicateStrategy", strategy)
    if (forceBlock.trim()) formData.append("forceBlock", forceBlock.toUpperCase())

    const importResult = await processImport(formData)
    setResult(importResult)
    setIsSubmitting(false)
  }

  const handleReset = () => {
    setFile(null)
    setUih("")
    setForceBlock("")
    setStrategy("skip")
    setResult(null)
  }

  return (
    <div className="animate-fade-in-up max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-purple-400 mb-1">
          <Upload className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Sklad</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Import dat</h1>
        <p className="text-slate-500 mt-1 text-sm">Hromadný import z Excel (.xlsx) nebo CSV souboru.</p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-5">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-300 flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Skript automaticky přeskočí hlavičky a balastní řádky. Nahrajte standardní export (CSV nebo přímo sešit XLSX).</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-200">Soubor (.xlsx, .csv) <span className="text-red-400">*</span></label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/[0.12] rounded-xl cursor-pointer bg-[#0a1628] hover:bg-[#0d1f3a] transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <FileText className="w-8 h-8 mb-2 text-blue-400" />
                      <p className="text-sm text-slate-100 font-semibold">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-slate-500" />
                      <p className="mb-2 text-sm text-slate-400">
                        <span className="font-semibold text-slate-200">Klikněte pro nahrání</span> nebo přetáhněte soubor
                      </p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileChange} required />
              </label>
            </div>
          </div>

          <div className="p-4 bg-[#0a1628] border border-white/[0.06] rounded-xl space-y-3">
            <label className="text-sm font-medium text-slate-300">Co udělat s existujícími (duplicitními) HU?</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input type="radio" name="strategy" value="skip" checked={strategy === 'skip'} onChange={() => setStrategy('skip')} className="w-4 h-4 accent-blue-500" />
                Ignorovat (Přeskočit)
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input type="radio" name="strategy" value="overwrite" checked={strategy === 'overwrite'} onChange={() => setStrategy('overwrite')} className="w-4 h-4 accent-red-500" />
                <span className="text-red-400 font-medium">Přepsat hodnoty v databázi</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Vaše UIH <span className="text-red-400">*</span></label>
              <input type="text" required value={uih} onChange={(e) => setUih(e.target.value)} placeholder="Např. UIH123" className="glass-input uppercase" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Vynutit BLOCK (Volitelné)</label>
              <input type="text" value={forceBlock} onChange={(e) => setForceBlock(e.target.value)} placeholder="Např. BLOCK-16" className="glass-input uppercase" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/[0.06] mt-4">
            <button type="submit" disabled={isSubmitting || !file || !uih.trim()} className="glass-button-primary">
              <Upload className="w-4 h-4" />
              {isSubmitting ? 'Zpracovávám data...' : 'Spustit import'}
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-panel p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-green-400/10 border border-green-400/20 p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
              <span className="text-3xl font-bold text-white">{result.successCount}</span>
              <span className="text-xs text-green-400 font-medium uppercase mt-2">Zpracováno</span>
            </div>
            <div className="bg-amber-400/10 border border-amber-400/20 p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
              <span className="text-3xl font-bold text-white">{result.skippedCount}</span>
              <span className="text-xs text-amber-400 font-medium uppercase mt-2">Přeskočeno</span>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" /> Varování a detaily
              </h4>
              <div className="max-h-40 overflow-y-auto bg-[#060d1b] p-3 rounded-lg border border-white/[0.06] text-sm">
                <ul className="space-y-2">
                  {result.errors.map((err, i) => (
                    <li key={i} className="text-slate-400 flex items-start gap-2 border-b border-white/[0.04] pb-2 last:border-0">
                      <span className="font-mono text-[10px] bg-white/[0.06] text-slate-300 px-1.5 py-0.5 rounded border border-white/[0.06] shrink-0 mt-0.5">
                        Řádek {err.rowNumber || '?'}
                      </span>
                      <span className="leading-snug">{err.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <button onClick={handleReset} className="glass-button-primary w-full justify-center">
            Importovat další soubor
          </button>
        </div>
      )}
    </div>
  )
}
