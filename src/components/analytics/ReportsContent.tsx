"use client"

import { FileBarChart, Download, Calendar, Package, ArrowRightLeft, Upload } from "lucide-react"
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface ReportsContentProps {
  stats: any
  transferTrend: { date: string; count: number }[]
}

export default function ReportsContent({ stats, transferTrend }: ReportsContentProps) {
  const reports = [
    {
      title: "Přehled skladových zásob",
      description: "Celkový přehled aktivních HU, materiálů a vytíženosti bloků.",
      icon: Package,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      metrics: [
        { label: "Aktivní HU", value: stats.activeCount },
        { label: "Aktivní bloky", value: stats.activeBlocks },
        { label: "Materiálů", value: stats.topMaterials?.length || 0 },
      ]
    },
    {
      title: "Přesuny do Pick skladu",
      description: "Report o přesunech do Pick skladu za aktuální měsíc.",
      icon: ArrowRightLeft,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      metrics: [
        { label: "Dnes", value: stats.transfersToday },
        { label: "Tento měsíc", value: stats.transfersMonth },
        { label: "Denní průměr", value: stats.transfersMonth ? Math.round(stats.transfersMonth / new Date().getDate()) : 0 },
      ]
    },
    {
      title: "Import operace",
      description: "Statistiky hromadných importů dat z Excel a CSV souborů.",
      icon: Upload,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      metrics: [
        { label: "Importy tento měsíc", value: stats.importsMonth },
        { label: "Archivované", value: stats.archivedCount },
      ]
    },
  ]

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <FileBarChart className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Analytika</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Reporty</h1>
          <p className="text-slate-500 mt-1 text-sm">Předdefinované reporty a přehledy pro management.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {reports.map((report, idx) => {
          const Icon = report.icon
          return (
            <div key={idx} className="glass-panel p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${report.bg}`}>
                  <Icon className={`w-5 h-5 ${report.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{report.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{report.description}</p>
                </div>
              </div>
              <div className="flex-1 space-y-2.5">
                {report.metrics.map((m, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{m.label}</span>
                    <span className="text-sm font-bold text-white">{m.value?.toLocaleString('cs-CZ') || 0}</span>
                  </div>
                ))}
              </div>
              <button className="glass-button text-xs py-2 mt-4 w-full justify-center">
                <Download className="w-3.5 h-3.5" /> Stáhnout report
              </button>
            </div>
          )
        })}
      </div>

      {/* Transfer Trend */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold text-white mb-4">Trend přesunů — posledních 7 dní</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transferTrend} barSize={28}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip 
                contentStyle={{ background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8', fontSize: 11 }}
                itemStyle={{ color: '#10b981', fontSize: 12 }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} name="Přesuny" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
