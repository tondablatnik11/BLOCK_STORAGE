"use client"

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ArrowRightLeft, Upload, Edit2, Archive, PackagePlus, Eye } from "lucide-react"

interface RightSidebarProps {
  blockUtilization: Record<string, number>
  transferTrend: { date: string; count: number }[]
  recentActivities: any[]
}

const actionConfig: Record<string, { label: string; icon: any; color: string; dotColor: string }> = {
  create: { label: "Přidání záznamu", icon: PackagePlus, color: "text-blue-400", dotColor: "bg-blue-500" },
  import: { label: "Import dat", icon: Upload, color: "text-purple-400", dotColor: "bg-purple-500" },
  update_quantity: { label: "Úprava záznamu", icon: Edit2, color: "text-amber-400", dotColor: "bg-amber-500" },
  update_bin: { label: "Změna pozice", icon: Edit2, color: "text-teal-400", dotColor: "bg-teal-500" },
  update_note: { label: "Úprava poznámky", icon: Edit2, color: "text-slate-400", dotColor: "bg-slate-500" },
  partial_transfer: { label: "Přesun do Pick skladu", icon: ArrowRightLeft, color: "text-emerald-400", dotColor: "bg-emerald-500" },
  full_transfer: { label: "Přesun do Pick skladu", icon: ArrowRightLeft, color: "text-emerald-500", dotColor: "bg-emerald-500" },
  archive: { label: "Archivace", icon: Archive, color: "text-red-400", dotColor: "bg-red-500" },
}

function getRelativeTime(dateString: string): string {
  const now = Date.now()
  const date = new Date(dateString).getTime()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "právě teď"
  if (minutes < 60) return `před ${minutes} min`
  if (hours < 24) return `před ${hours} hod`
  return `před ${days} dny`
}

function getBlockLevel(count: number): string {
  if (count === 0) return "block-cell-empty"
  if (count <= 5) return "block-cell-low"
  if (count <= 15) return "block-cell-medium"
  return "block-cell-high"
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1b2a] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
        <p className="text-slate-400">{label}</p>
        <p className="text-emerald-400 font-bold">{payload[0].value} přesunů</p>
      </div>
    )
  }
  return null
}

export default function RightSidebar({ blockUtilization, transferTrend, recentActivities }: RightSidebarProps) {
  // Generate block grid 01-30
  const blocks = Array.from({ length: 30 }, (_, i) => {
    const num = String(i + 1).padStart(2, "0")
    const blockName = `BLOCK-${num}`
    const count = blockUtilization[blockName] || 0
    return { num, blockName, count }
  })

  return (
    <aside className="w-[280px] shrink-0 space-y-4">
      {/* ═══ Widget 1: Vytíženost bloků ═══ */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Vytíženost bloků</h3>
          <button className="text-[10px] text-blue-400 font-medium hover:text-blue-300 transition-colors">
            Zobrazit všechny
          </button>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {blocks.map((block) => (
            <div
              key={block.num}
              className={`block-cell ${getBlockLevel(block.count)}`}
              title={`${block.blockName}: ${block.count} HU`}
            >
              {block.num}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Widget 2: Přesuny do Pick skladu (7 dní) ═══ */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Přesuny do Pick skladu (7 dní)</h3>
          <span className="text-[10px] text-slate-500 font-medium bg-[#0a1628] px-2 py-0.5 rounded-md border border-white/[0.06]">
            7 dní
          </span>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transferTrend} barSize={18}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 9, fill: '#64748b' }} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 9, fill: '#64748b' }} 
                axisLine={false} 
                tickLine={false}
                width={25}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar 
                dataKey="count" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
                className="cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ═══ Widget 3: Poslední aktivity ═══ */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Poslední aktivity</h3>
          <button className="text-[10px] text-blue-400 font-medium hover:text-blue-300 transition-colors">
            Zobrazit vše
          </button>
        </div>
        <div className="space-y-3">
          {recentActivities.slice(0, 5).map((activity, idx) => {
            const config = actionConfig[activity.action] || { label: activity.action, icon: Eye, color: "text-slate-400", dotColor: "bg-slate-500" }
            return (
              <div key={activity.id || idx} className="flex items-start gap-2.5">
                <div className={`activity-dot ${config.dotColor} mt-1.5 shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${config.color} leading-tight`}>{config.label}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                    HU:{activity.hu_number?.slice(-10) || "—"}
                  </p>
                </div>
                <span className="text-[10px] text-slate-600 whitespace-nowrap shrink-0">
                  {getRelativeTime(activity.created_at)}
                </span>
              </div>
            )
          })}
          
          {recentActivities.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-4">Žádné aktivity</p>
          )}
        </div>
      </div>
    </aside>
  )
}
