"use client"

import { useState, useEffect } from "react"
import { X, Package, MapPin, Layers, Filter, Loader2 } from "lucide-react"
import { getBlockMaterialSummary, BlockSummary } from "../../actions/inventory"
import { formatDate } from "../../lib/utils"

interface BlockDetailDrawerProps {
  block: string | null
  onClose: () => void
  onFilterBlock?: (block: string) => void
}

export default function BlockDetailDrawer({ block, onClose, onFilterBlock }: BlockDetailDrawerProps) {
  const [data, setData] = useState<BlockSummary | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (block) {
      setLoading(true)
      getBlockMaterialSummary(block).then(result => {
        setData(result)
        setLoading(false)
      })
    } else {
      setData(null)
    }
  }, [block])

  if (!block) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[420px] bg-[#0a1628] border-l border-white/[0.06] z-50 shadow-2xl animate-in slide-in-from-right-full duration-300 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/15 rounded-xl">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">{block}</h2>
                <p className="text-xs text-slate-500">Detail bloku</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p className="text-sm font-medium">Načítám data bloku...</p>
            </div>
          ) : data ? (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0d1b2a] border border-white/[0.06] rounded-xl p-3 text-center">
                  <Package className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-white">{data.total_hu}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">HU</p>
                </div>
                <div className="bg-[#0d1b2a] border border-white/[0.06] rounded-xl p-3 text-center">
                  <Layers className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-white">{data.total_quantity.toLocaleString('cs-CZ')}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kusů</p>
                </div>
                <div className="bg-[#0d1b2a] border border-white/[0.06] rounded-xl p-3 text-center">
                  <MapPin className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-white">{data.unique_materials}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Materiálů</p>
                </div>
              </div>

              {/* Filter button */}
              {onFilterBlock && (
                <button
                  onClick={() => { onFilterBlock(block); onClose() }}
                  className="w-full glass-button text-xs py-2.5 justify-center"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filtrovat {block} v tabulce
                </button>
              )}

              {/* Materials table */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Materiály v bloku</h3>
                {data.materials.length > 0 ? (
                  <div className="space-y-2">
                    {data.materials.map((mat, i) => (
                      <div 
                        key={i} 
                        className="bg-[#060d1b] border border-white/[0.06] rounded-xl p-3 hover:border-white/[0.12] transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-bold text-slate-200 leading-tight">{mat.material}</p>
                          <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-lg shrink-0 ml-2">
                            {mat.hu_count} HU
                          </span>
                        </div>
                        <div className="flex gap-4 text-[11px] text-slate-500">
                          <span>{mat.total_quantity.toLocaleString('cs-CZ')} ks</span>
                          <span>{mat.bin_count} pozic</span>
                          <span className="ml-auto">{formatDate(mat.last_updated)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">Blok je prázdný</p>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  )
}
