"use client"

import { useState, useMemo } from "react"
import { InventoryRecord } from "../../types/app"
import { formatDate } from "../../lib/utils"
import SearchBar from "./SearchBar"
import { Edit2, ArrowRightLeft, Package, Archive, Download, ArrowUpDown, Filter, Plus, X, Columns, Bookmark, MoreHorizontal } from "lucide-react"
import EditRecordModal from "../modals/EditRecordModal"
import TransferModal from "../modals/TransferModal"
import BulkArchiveModal from "../modals/BulkArchiveModal"
import AddRecordModal from "../modals/AddRecordModal"

interface InventoryTableProps {
  initialData: InventoryRecord[]
}

type SortConfig = {
  key: keyof InventoryRecord
  direction: 'asc' | 'desc'
} | null

// Get position dot color based on first segment
function getPositionColor(pos: string): string {
  if (!pos) return "bg-slate-600"
  const seg = pos.split("-")[0]
  const num = parseInt(seg, 10)
  if (isNaN(num)) return "bg-slate-600"
  if (num <= 1) return "bg-emerald-500"
  if (num <= 2) return "bg-amber-500"
  return "bg-red-500"
}

export default function InventoryTable({ initialData }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  
  const [filterBlock, setFilterBlock] = useState("")
  const [filterMaterial, setFilterMaterial] = useState("")
  const [filterHu, setFilterHu] = useState("")
  const [filterBin, setFilterBin] = useState("")

  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'updated_at', direction: 'desc' })
  
  const [editingRecord, setEditingRecord] = useState<InventoryRecord | null>(null)
  const [transferringRecord, setTransferringRecord] = useState<InventoryRecord | null>(null)
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkArchiveOpen, setIsBulkArchiveOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  // Unique values for dropdown filters
  const uniqueBlocks = useMemo(() => [...new Set(initialData.map(r => r.block))].sort(), [initialData])
  const uniqueMaterials = useMemo(() => [...new Set(initialData.map(r => r.material))].sort(), [initialData])

  const filteredData = useMemo(() => {
    let processedData = [...initialData]

    if (filterBlock) processedData = processedData.filter(r => r.block === filterBlock)
    if (filterMaterial) processedData = processedData.filter(r => r.material === filterMaterial)
    if (filterHu) processedData = processedData.filter(r => r.hu_number.toLowerCase().includes(filterHu.toLowerCase()))
    if (filterBin) processedData = processedData.filter(r => r.bin_location.toLowerCase().includes(filterBin.toLowerCase()))

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      processedData = processedData.filter((record) => 
        record.material.toLowerCase().includes(term) ||
        record.hu_number.toLowerCase().includes(term) ||
        record.bin_location.toLowerCase().includes(term) ||
        record.block.toLowerCase().includes(term) ||
        (record.notes && record.notes.toLowerCase().includes(term))
      )
    }

    if (sortConfig) {
      processedData.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]
        
        if (aVal === null) return 1
        if (bVal === null) return -1
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return processedData
  }, [initialData, searchTerm, filterBlock, filterMaterial, filterHu, filterBin, sortConfig])

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(new Set(filteredData.map(r => r.id)))
    else setSelectedIds(new Set())
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const nextSet = new Set(selectedIds)
    if (checked) nextSet.add(id)
    else nextSet.delete(id)
    setSelectedIds(nextSet)
  }

  const handleSort = (key: keyof InventoryRecord) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const escapeCsvValue = (val: any) => {
    if (val === null || val === undefined) return ""
    const str = String(val)
    if (str.includes(';') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const exportToCSV = () => {
    const headers = ["BLOCK", "Materiál", "HU", "Množství", "Pozice", "Poznámka", "Aktualizováno"]
    const rows = filteredData.map(r => [
      escapeCsvValue(r.block), 
      escapeCsvValue(r.material), 
      escapeCsvValue(r.hu_number), 
      escapeCsvValue(r.quantity), 
      escapeCsvValue(r.bin_location), 
      escapeCsvValue(r.notes || ""), 
      escapeCsvValue(formatDate(r.updated_at))
    ])
    
    const csvContent = [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n")
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `WMS_Export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const clearAllFilters = () => {
    setFilterBlock("")
    setFilterMaterial("")
    setFilterHu("")
    setFilterBin("")
    setSearchTerm("")
  }

  const hasActiveFilters = filterBlock || filterMaterial || filterHu || filterBin
  const allSelected = filteredData.length > 0 && selectedIds.size === filteredData.length
  const SortIcon = () => <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-30" />

  return (
    <div className="space-y-4 pb-28">
      {/* ═══ Table Header Bar ═══ */}
      <div className="glass-panel p-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Left: Title + count */}
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Skladové zásoby</h2>
              <span className="text-xs text-slate-500">{filteredData.length.toLocaleString('cs-CZ')} záznamů</span>
            </div>
          </div>
          
          {/* Right: Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={exportToCSV}
              disabled={filteredData.length === 0}
              className="glass-button text-xs py-2 px-3 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button className="glass-button text-xs py-2 px-3">
              <Columns className="w-3.5 h-3.5" /> Sloupce
            </button>
            <button className="glass-button text-xs py-2 px-3">
              <Bookmark className="w-3.5 h-3.5" /> Uložené pohledy
            </button>
            <button 
              onClick={() => setIsAddOpen(true)}
              className="glass-button-primary text-xs py-2 px-3"
            >
              <Plus className="w-3.5 h-3.5" /> Přidat záznam
            </button>
          </div>
        </div>

        {/* ═══ Filter Row ═══ */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 mt-4 pt-4 border-t border-white/[0.04]">
          <div className="w-full lg:w-56">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>

          {/* Dropdown filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold">BLOCK</span>
              <select
                value={filterBlock}
                onChange={(e) => setFilterBlock(e.target.value)}
                className="glass-input py-1.5 px-2 text-xs min-w-[110px] cursor-pointer"
              >
                <option value="" className="bg-[#0a1628]">Všechny</option>
                {uniqueBlocks.map(b => (
                  <option key={b} value={b} className="bg-[#0a1628]">{b}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Materiál</span>
              <select
                value={filterMaterial}
                onChange={(e) => setFilterMaterial(e.target.value)}
                className="glass-input py-1.5 px-2 text-xs min-w-[110px] cursor-pointer"
              >
                <option value="" className="bg-[#0a1628]">Všechny</option>
                {uniqueMaterials.map(m => (
                  <option key={m} value={m} className="bg-[#0a1628]">{m}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold">HU</span>
              <input
                type="text"
                placeholder="Všechny"
                value={filterHu}
                onChange={(e) => setFilterHu(e.target.value)}
                className="glass-input py-1.5 px-2 text-xs w-[110px]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Pozice</span>
              <input
                type="text"
                placeholder="Všechny"
                value={filterBin}
                onChange={(e) => setFilterBin(e.target.value)}
                className="glass-input py-1.5 px-2 text-xs w-[110px]"
              />
            </div>

            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`text-xs py-1.5 px-3 rounded-lg border font-bold flex items-center gap-1.5 transition-all ${
                showFilters 
                  ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' 
                  : 'bg-[#0a1628] border-white/[0.06] text-slate-400 hover:text-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" /> Další filtry
            </button>

            {hasActiveFilters && (
              <button 
                onClick={clearAllFilters}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* ═══ Active Filter Badges ═══ */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {filterBlock && (
              <span className="filter-badge filter-badge-active">
                BLOCK: {filterBlock}
                <button onClick={() => setFilterBlock("")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterMaterial && (
              <span className="filter-badge filter-badge-active">
                Materiál: {filterMaterial}
                <button onClick={() => setFilterMaterial("")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterHu && (
              <span className="filter-badge filter-badge-active">
                HU: {filterHu}
                <button onClick={() => setFilterHu("")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterBin && (
              <span className="filter-badge filter-badge-active">
                Pozice: {filterBin}
                <button onClick={() => setFilterBin("")}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button 
              onClick={clearAllFilters}
              className="text-xs text-slate-500 hover:text-blue-400 font-medium flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Vymazat filtry
            </button>
          </div>
        )}
      </div>

      {/* ═══ Data Table ═══ */}
      <div className="glass-panel overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#060d1b] border-b border-white/[0.08] select-none">
              <tr>
                <th className="px-4 py-3 w-10 text-center border-r border-white/[0.04]">
                  <input type="checkbox" checked={allSelected} onChange={handleSelectAll} className="w-4 h-4 rounded border-slate-700 bg-[#0a1628] accent-blue-500 cursor-pointer" />
                </th>
                <th onClick={() => handleSort('block')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-blue-400 transition-colors">BLOCK <SortIcon /></th>
                <th onClick={() => handleSort('material')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-blue-400 transition-colors">Materiál <SortIcon /></th>
                <th onClick={() => handleSort('hu_number')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-blue-400 transition-colors">HU <SortIcon /></th>
                <th onClick={() => handleSort('quantity')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-blue-400 transition-colors">Množství <SortIcon /></th>
                <th onClick={() => handleSort('bin_location')} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-blue-400 transition-colors">Pozice <SortIcon /></th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Poznámka</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Akce</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-white/[0.03] text-slate-300">
              {filteredData.length > 0 ? (
                filteredData.map((record) => {
                  const isSelected = selectedIds.has(record.id)
                  return (
                    <tr key={record.id} className={`glass-table-row group ${isSelected ? 'bg-blue-600/[0.08]' : ''}`}>
                      <td className="px-4 py-2.5 text-center border-r border-white/[0.04]">
                        <input type="checkbox" checked={isSelected} onChange={(e) => handleSelectOne(record.id, e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-[#0a1628] accent-blue-500 cursor-pointer" />
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-[13px] font-bold text-slate-400">
                        {record.block}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm font-black text-slate-100">
                        {record.material}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-xs font-mono text-blue-400 tracking-wider">
                        {record.hu_number}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm font-mono">
                        <span className="font-bold text-white">{record.quantity}</span>
                        <span className="text-xs text-slate-500 ml-1">ks</span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-[13px] font-mono text-slate-400 group-hover:text-slate-200 transition-colors">
                        <span className={`position-dot ${getPositionColor(record.bin_location)}`}></span>
                        {record.bin_location}
                      </td>
                      <td className="px-4 py-2.5 text-[13px] text-slate-500 max-w-[180px] truncate" title={record.notes || ""}>
                        {record.notes || "—"}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingRecord(record)} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-md transition-colors" title="Upravit"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setTransferringRecord(record)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors" title="Přesun do SAPu"><ArrowRightLeft className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 text-slate-500 hover:bg-white/[0.06] rounded-md transition-colors" title="Více"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-[#0a1628] rounded-2xl border border-white/[0.06]">
                        <Package className="w-8 h-8 text-slate-700" />
                      </div>
                      <p className="text-slate-500 font-bold tracking-wide mt-1 text-sm">ŽÁDNÁ DATA NENALEZENA</p>
                      <button onClick={clearAllFilters} className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider">
                        Vymazat filtry
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ Bottom Action Bar ═══ */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0d1b2a]/95 backdrop-blur-xl px-6 py-3.5 flex items-center gap-5 animate-in slide-in-from-bottom-10 border border-white/[0.1] shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">
              Vybráno {selectedIds.size} z {initialData.length.toLocaleString('cs-CZ')}
            </span>
            <span className="text-[10px] text-slate-500">Označte záznamy pro akce</span>
          </div>
          
          <div className="w-px h-8 bg-white/[0.08]"></div>
          
          <button 
            onClick={exportToCSV}
            className="glass-button text-xs py-2 px-3"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          
          <button className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 transition-all font-bold px-3 py-2 rounded-xl flex items-center gap-2 text-xs">
            <ArrowRightLeft className="w-3.5 h-3.5" /> 
            Hromadný přesun do SAP
          </button>
          
          <button 
            onClick={() => setIsBulkArchiveOpen(true)} 
            className="bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 transition-all font-bold px-3 py-2 rounded-xl flex items-center gap-2 text-xs"
          >
            <Archive className="w-3.5 h-3.5" /> 
            Hromadná archivace
          </button>
          
          <button 
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-slate-400 hover:text-slate-200 font-medium px-2 py-2 transition-colors"
          >
            Zrušit výběr
          </button>
        </div>
      )}

      <EditRecordModal isOpen={!!editingRecord} onClose={() => setEditingRecord(null)} record={editingRecord} />
      <TransferModal isOpen={!!transferringRecord} onClose={() => setTransferringRecord(null)} record={transferringRecord} />
      <BulkArchiveModal isOpen={isBulkArchiveOpen} onClose={() => setIsBulkArchiveOpen(false)} selectedIds={Array.from(selectedIds)} onSuccess={() => setSelectedIds(new Set())} />
      <AddRecordModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  )
}
