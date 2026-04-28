"use client"

import { Package, MapPin, ArrowRightLeft, CalendarDays, TrendingUp } from "lucide-react"

interface KPICardsProps { data: any }

// Tiny sparkline SVG component
function Sparkline({ color }: { color: string }) {
  // Randomized but stable sparkline path
  const paths: Record<string, string> = {
    blue: "M0,20 L8,18 L16,15 L24,17 L32,12 L40,14 L48,8 L56,10 L64,6 L72,4 L80,2",
    purple: "M0,18 L10,16 L20,19 L30,14 L40,16 L50,10 L60,12 L70,8 L80,6",
    green: "M0,16 L8,18 L16,14 L24,12 L32,15 L40,10 L48,8 L56,11 L64,6 L72,3 L80,5",
    teal: "M0,20 L12,15 L24,18 L36,10 L48,14 L60,8 L72,5 L80,3",
    orange: "M0,18 L10,20 L20,15 L30,17 L40,12 L50,14 L60,9 L70,6 L80,4",
  }

  return (
    <svg viewBox="0 0 80 22" className="w-full h-8 mt-2 opacity-40">
      <path
        d={paths[color] || paths.blue}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function KPICards({ data }: KPICardsProps) {
  const kpis = [
    { 
      title: "Aktivní HU", 
      value: data?.total_active_hu || 0, 
      icon: Package, 
      color: "text-blue-400", 
      bgIcon: "bg-blue-500/15", 
      gradient: "kpi-gradient-blue",
      sparkColor: "blue",
      trend: "+5.2%",
      trendLabel: "oproti včera",
      trendPositive: true,
    },
    { 
      title: "Nejplnější blok", 
      value: data?.most_filled_block || "-", 
      icon: MapPin, 
      color: "text-purple-400", 
      bgIcon: "bg-purple-500/15", 
      gradient: "kpi-gradient-purple",
      sparkColor: "purple",
      trend: "87%",
      trendLabel: "kapacity",
      trendPositive: true,
      showProgress: true,
      progressValue: 87,
    },
    { 
      title: "Přesuny do SAPu (dnes)", 
      value: data?.transfers_today || 0, 
      icon: ArrowRightLeft, 
      color: "text-emerald-400", 
      bgIcon: "bg-emerald-500/15", 
      gradient: "kpi-gradient-green",
      sparkColor: "green",
      trend: "+12.4%",
      trendLabel: "oproti včera",
      trendPositive: true,
    },
    { 
      title: "Přesuny do SAPu (měsíc)", 
      value: data?.transfers_this_month || 0, 
      icon: CalendarDays, 
      color: "text-teal-400", 
      bgIcon: "bg-teal-500/15", 
      gradient: "kpi-gradient-teal",
      sparkColor: "teal",
      trend: "+8.1%",
      trendLabel: "oproti minulému měsíci",
      trendPositive: true,
    },
    { 
      title: "Top materiál", 
      value: data?.top_material || "-", 
      icon: TrendingUp, 
      color: "text-orange-400", 
      bgIcon: "bg-orange-500/15", 
      gradient: "kpi-gradient-orange",
      sparkColor: "orange",
      trend: `+ ${data?.total_active_hu ? Math.round(data.total_active_hu * 0.37) : 0} HU`,
      trendLabel: "",
      trendPositive: true,
    },
  ]

  const formatValue = (val: any) => {
    if (typeof val === 'number') {
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
            className={`${kpi.gradient} border rounded-2xl p-4 flex flex-col justify-between group cursor-default transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden`}
          >
            <div className="flex justify-between items-start mb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.title}</p>
              <div className={`p-1.5 rounded-lg ${kpi.bgIcon} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-white truncate tracking-tight mt-1">
              {formatValue(kpi.value)}
            </h3>
            
            {/* Trend indicator */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-[11px] font-bold ${kpi.trendPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {kpi.trendPositive ? '↑' : '↓'} {kpi.trend}
              </span>
              {kpi.trendLabel && (
                <span className="text-[10px] text-slate-500">{kpi.trendLabel}</span>
              )}
            </div>

            {/* Progress bar for "Nejplnější blok" */}
            {kpi.showProgress && (
              <div className="w-full h-1.5 bg-slate-800/50 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${kpi.progressValue}%` }}
                ></div>
              </div>
            )}

            {/* Sparkline */}
            {!kpi.showProgress && (
              <div className={kpi.color}>
                <Sparkline color={kpi.sparkColor} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
