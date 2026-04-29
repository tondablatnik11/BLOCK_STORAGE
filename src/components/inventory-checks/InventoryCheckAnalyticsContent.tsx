"use client"

import { ClipboardCheck, CheckCircle2, AlertTriangle, Calendar, TrendingUp, Package, MapPin } from "lucide-react"
import { CheckAnalytics } from "../../actions/inventoryChecks"

interface Props {
  analytics: CheckAnalytics
}

export default function InventoryCheckAnalyticsContent({ analytics }: Props) {
  const { checksToday, checksThisMonth, okCount, nokCount, nokPercent, topNokMaterials, topNokBlocks, recentChecks } = analytics

  const okPercent = checksThisMonth > 0 ? Math.round((okCount / checksThisMonth) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-2 bg-teal-500/15 rounded-xl">
          <TrendingUp className="w-5 h-5 text-teal-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Přehled inventur</h1>
          <p className="text-slate-500 text-sm">Analytika a KPI inventurních kontrol za aktuální měsíc.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inventury dnes</p>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white">{checksToday}</p>
        </div>

        <div className="glass-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inventury tento měsíc</p>
            <ClipboardCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white">{checksThisMonth}</p>
        </div>

        <div className="glass-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">OK</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">{okCount}</p>
          <div className="mt-2 h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${okPercent}%` }} />
          </div>
          <p className="text-[10px] text-emerald-400/60 mt-1">{okPercent}% úspěšnost</p>
        </div>

        <div className="glass-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">NOK</p>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-3xl font-black text-red-400">{nokCount}</p>
          <div className="mt-2 h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${nokPercent}%` }} />
          </div>
          <p className="text-[10px] text-red-400/60 mt-1">{nokPercent}% nesrovnalostí</p>
        </div>
      </div>

      {/* Top NOK tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top NOK materials */}
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">Top NOK materiály</h3>
          </div>
          {topNokMaterials.length > 0 ? (
            <div className="space-y-3">
              {topNokMaterials.map((m, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 font-mono w-5">{i + 1}.</span>
                    <span className="text-xs text-slate-300 font-medium truncate max-w-[200px]">{m.material}</span>
                  </div>
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg">{m.count}×</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600 text-center py-4">Žádné NOK materiály</p>
          )}
        </div>

        {/* Top NOK blocks */}
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Top NOK bloky</h3>
          </div>
          {topNokBlocks.length > 0 ? (
            <div className="space-y-3">
              {topNokBlocks.map((b, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 font-mono w-5">{i + 1}.</span>
                    <span className="text-xs text-slate-300 font-bold">{b.block}</span>
                  </div>
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg">{b.count}×</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600 text-center py-4">Žádné NOK bloky</p>
          )}
        </div>
      </div>

      {/* Recent checks */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold text-white mb-4">Posledních 10 inventur</h3>
        <div className="space-y-2">
          {recentChecks.length > 0 ? recentChecks.map((check) => (
            <div key={check.id} className="flex items-center gap-4 bg-[#060d1b] border border-white/[0.06] rounded-xl px-4 py-2.5">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                check.result === 'OK'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/15 text-red-400 border border-red-500/30'
              }`}>
                {check.result}
              </span>
              <span className="text-xs font-mono text-blue-400 w-28 truncate">{check.hu_number.slice(-12)}</span>
              <span className="text-xs text-slate-400 font-bold w-20">{check.block}</span>
              <span className="text-xs text-slate-400 truncate flex-1">{check.material}</span>
              <span className="text-xs text-slate-500 font-mono">{check.checked_by_uih}</span>
              <span className="text-[10px] text-slate-600 whitespace-nowrap">
                {new Date(check.checked_at).toLocaleDateString('cs-CZ')}
              </span>
            </div>
          )) : (
            <p className="text-xs text-slate-600 text-center py-4">Žádné inventury tento měsíc</p>
          )}
        </div>
      </div>
    </div>
  )
}
