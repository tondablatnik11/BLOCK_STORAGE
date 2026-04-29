"use client"

import { Package, MapPin, ArrowRightLeft, CalendarDays, TrendingUp } from "lucide-react"

interface KPICardsProps { data: any }

export default function KPICards({ data }: KPICardsProps) {
  // Spočítat kolik HU je v nejplnějším bloku
  const mostFilledBlock = data?.most_filled_block || "-"
  const mostFilledCount = data?.most_filled_block_count || null

  const kpis = [
    { 
      title: "Celkový počet HU", 
      value: data?.total_active_hu || 0, 
      icon: Package, 
      color: "text-blue-400", 
      bgIcon: "bg-blue-500/15", 
      gradient: "kpi-gradient-blue",
      formatAsNumber: true,
    },
    { 
      title: "Nejvytíženější BLOCK", 
      value: mostFilledBlock, 
      subtitle: mostFilledCount ? `${mostFilledCount} HU` : null,
      icon: MapPin, 
      color: "text-purple-400", 
      bgIcon: "bg-purple-500/15", 
      gradient: "kpi-gradient-purple",
    },
    { 
      title: "Přesuny do Pick skladu (dnes)", 
      value: data?.transfers_today || 0, 
      icon: ArrowRightLeft, 
      color: "text-emerald-400", 
      bgIcon: "bg-emerald-500/15", 
      gradient: "kpi-gradient-green",
      formatAsNumber: true,
    },
    { 
      title: "Přesuny do Pick skladu (měsíc)", 
      value: data?.transfers_this_month || 0, 
      icon: CalendarDays, 
      color: "text-teal-400", 
      bgIcon: "bg-teal-500/15", 
      gradient: "kpi-gradient-teal",
      formatAsNumber: true,
    },
    { 
      title: "Top materiál podle HU", 
      value: data?.top_material || "-", 
      icon: TrendingUp, 
      color: "text-orange-400", 
      bgIcon: "bg-orange-500/15", 
      gradient: "kpi-gradient-orange",
    },
  ]

  const formatValue = (val: any, asNumber?: boolean) => {
    if (asNumber && typeof val === 'number') {
      return val.toLocaleString('cs-CZ')
    }
    return val
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <div 
            key={index}
            className={`${kpi.gradient} border rounded-2xl p-4 flex flex-col justify-between group cursor-default transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden min-h-[100px]`}
          >
            <div className="flex justify-between items-start mb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight pr-2">{kpi.title}</p>
              <div className={`p-1.5 rounded-lg ${kpi.bgIcon} transition-transform duration-300 group-hover:scale-110 shrink-0`}>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-white truncate tracking-tight mt-auto">
              {formatValue(kpi.value, kpi.formatAsNumber)}
            </h3>
            
            {/* Subtitle (e.g., HU count for most filled block) */}
            {kpi.subtitle && (
              <span className="text-xs text-slate-400 font-semibold mt-0.5">{kpi.subtitle}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
