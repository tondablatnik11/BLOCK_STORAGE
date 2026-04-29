"use client"

import { TrendingUp, Package, ArrowRightLeft, Upload, Archive, Layers } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1']

export default function StatisticsContent({ stats }: { stats: any }) {
  const totalHU = (stats.activeCount || 0) + (stats.archivedCount || 0)
  const activePercent = totalHU > 0 ? Math.round((stats.activeCount / totalHU) * 100) : 0

  const statusData = [
    { name: "Aktivní", value: stats.activeCount || 0 },
    { name: "Archivované", value: stats.archivedCount || 0 },
  ]

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Analytika</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Statistiky</h1>
        <p className="text-slate-500 mt-1 text-sm">Detailní statistiky a rozložení dat skladu.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-bold text-white mb-4">Rozložení stavu HU</h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={52} strokeWidth={0}>
                    <Cell fill="#3b82f6" />
                    <Cell fill="#475569" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-slate-400">Aktivní</span>
                </div>
                <span className="text-xl font-black text-white ml-5">{stats.activeCount?.toLocaleString('cs-CZ') || 0}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                  <span className="text-xs text-slate-400">Archivované</span>
                </div>
                <span className="text-xl font-black text-white ml-5">{stats.archivedCount?.toLocaleString('cs-CZ') || 0}</span>
              </div>
              <div className="pt-2 border-t border-white/[0.06]">
                <span className="text-[11px] text-emerald-400 font-bold">{activePercent}% aktivních</span>
              </div>
            </div>
          </div>
        </div>

        {/* Operation Stats */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-bold text-white mb-4">Operace tento měsíc</h3>
          <div className="space-y-4">
            {[
              { label: "Přesuny do Pick skladu", value: stats.transfersMonth, icon: ArrowRightLeft, color: "text-emerald-400", bar: "bg-emerald-500" },
              { label: "Hromadné importy", value: stats.importsMonth, icon: Upload, color: "text-purple-400", bar: "bg-purple-500" },
              { label: "Přesuny dnes", value: stats.transfersToday, icon: ArrowRightLeft, color: "text-teal-400", bar: "bg-teal-500" },
            ].map((item, i) => {
              const Icon = item.icon
              const max = Math.max(stats.transfersMonth || 1, stats.importsMonth || 1, stats.transfersToday || 1)
              const width = max > 0 ? Math.max(5, Math.round(((item.value || 0) / max) * 100)) : 5
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span className="text-xs text-slate-400">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{item.value?.toLocaleString('cs-CZ') || 0}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                    <div className={`h-full ${item.bar} rounded-full transition-all duration-700`} style={{ width: `${width}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Block Stats */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-bold text-white mb-4">Bloky</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-amber-400" /> Aktivní bloky</span>
              <span className="text-lg font-black text-white">{stats.activeBlocks} / 30</span>
            </div>
            <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${Math.round((stats.activeBlocks / 30) * 100)}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-500">
              Bloky s nejvíce HU:
            </p>
            <div className="space-y-1.5">
              {Object.entries(stats.blockUtilization || {})
                .sort(([,a]: any, [,b]: any) => b - a)
                .slice(0, 5)
                .map(([block, count]: any) => (
                  <div key={block} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-mono font-bold">{block}</span>
                    <span className="text-slate-500 font-mono">{count} HU</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Materials Table */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold text-white mb-4">Top materiály</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(stats.topMaterials || []).map((m: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 bg-[#0a1628] p-3 rounded-xl border border-white/[0.04]">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
              <span className="text-sm font-bold text-white flex-1 truncate">{m.name}</span>
              <span className="text-xs font-mono text-slate-400">{m.count} HU</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
