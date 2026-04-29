"use client"

import { BarChart3, Package, Archive, ArrowRightLeft, Upload, TrendingUp, Layers } from "lucide-react"
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, AreaChart, Area } from "recharts"

interface DashboardContentProps {
  stats: any
  transferTrend: { date: string; count: number }[]
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1b2a] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="text-slate-400">{label}</p>
        <p className="text-blue-400 font-bold">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export default function DashboardContent({ stats, transferTrend }: DashboardContentProps) {
  const summaryCards = [
    { title: "Aktivní HU", value: stats.activeCount, icon: Package, color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "Archivované", value: stats.archivedCount, icon: Archive, color: "text-slate-400", bg: "bg-slate-500/10" },
    { title: "Přesuny dnes", value: stats.transfersToday, icon: ArrowRightLeft, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { title: "Přesuny tento měsíc", value: stats.transfersMonth, icon: TrendingUp, color: "text-teal-400", bg: "bg-teal-500/10" },
    { title: "Importy tento měsíc", value: stats.importsMonth, icon: Upload, color: "text-purple-400", bg: "bg-purple-500/10" },
    { title: "Aktivní bloky", value: stats.activeBlocks, icon: Layers, color: "text-amber-400", bg: "bg-amber-500/10" },
  ]

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <div className="flex items-center gap-2 text-blue-400 mb-1">
          <BarChart3 className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Analytika</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">Přehled klíčových metrik a statistik skladu.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="glass-panel p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.title}</span>
                <div className={`p-1.5 rounded-lg ${card.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>
              <span className="text-2xl font-black text-white">{card.value?.toLocaleString('cs-CZ') || 0}</span>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer Trend Chart */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-bold text-white mb-4">Přesuny do Pick skladu — posledních 7 dní</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transferTrend} barSize={24}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Materials Pie Chart */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-bold text-white mb-4">Top materiály (aktivní HU)</h3>
          <div className="flex items-center">
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.topMaterials || []}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    strokeWidth={0}
                  >
                    {(stats.topMaterials || []).map((_: any, idx: number) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5 ml-4">
              {(stats.topMaterials || []).slice(0, 6).map((m: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-slate-300 font-medium truncate">{m.name}</span>
                  <span className="text-slate-500 ml-auto font-mono">{m.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold text-white mb-4">Denní aktivita — posledních 30 dní</h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.dailyActions || []}>
              <defs>
                <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#colorActions)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Block Utilization Heat Map */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold text-white mb-4">Vytíženost bloků — přehled</h3>
        <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-15 gap-2">
          {Array.from({ length: 30 }, (_, i) => {
            const num = String(i + 1).padStart(2, "0")
            const blockName = `BLOCK-${num}`
            const count = stats.blockUtilization?.[blockName] || 0
            let level = "block-cell-empty"
            if (count > 0 && count <= 5) level = "block-cell-low"
            else if (count > 5 && count <= 15) level = "block-cell-medium"
            else if (count > 15) level = "block-cell-high"

            return (
              <div key={num} className="flex flex-col items-center gap-1">
                <div className={`block-cell ${level} w-12 h-12 text-sm`} title={`${blockName}: ${count} HU`}>
                  {num}
                </div>
                <span className="text-[9px] text-slate-600 font-mono">{count} HU</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
