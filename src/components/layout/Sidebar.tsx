"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, Package, PackagePlus, Upload, 
  ArrowRightLeft, Layers, Undo2, 
  ScrollText, GitBranch, FileDown,
  BarChart3, FileBarChart, TrendingUp,
  Settings, ChevronDown, Box, CheckCircle2
} from "lucide-react"
import { useState } from "react"

interface NavSection {
  category: string
  items: {
    name: string
    href: string
    icon: any
    badge?: string
  }[]
}

const navSections: NavSection[] = [
  {
    category: "",
    items: [
      { name: "Přehled", href: "/", icon: LayoutDashboard },
    ]
  },
  {
    category: "SKLAD",
    items: [
      { name: "Skladové zásoby", href: "/", icon: Package },
      { name: "Přidat záznam", href: "/add", icon: PackagePlus },
      { name: "Import dat", href: "/import", icon: Upload },
    ]
  },
  {
    category: "OPERACE",
    items: [
      { name: "Přesun do Pick skladu", href: "/transfer", icon: ArrowRightLeft },
      { name: "Hromadné akce", href: "/bulk", icon: Layers },
      { name: "Undo poslední akce", href: "/history", icon: Undo2 },
    ]
  },
  {
    category: "HISTORIE",
    items: [
      { name: "Audit historie", href: "/history", icon: ScrollText },
      { name: "Pohyby HU", href: "/movements", icon: GitBranch },
      { name: "Import historie", href: "/import-history", icon: FileDown },
    ]
  },
  {
    category: "ANALYTIKA",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
      { name: "Reporty", href: "/reports", icon: FileBarChart },
      { name: "Statistiky", href: "/statistics", icon: TrendingUp },
    ]
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [systemOpen, setSystemOpen] = useState(false)

  return (
    <aside className="w-60 h-screen bg-[#060d1b] border-r border-white/[0.06] flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-600/15 rounded-lg border border-blue-500/25 shadow-[0_0_12px_rgba(37,99,235,0.15)]">
            <Box className="w-5 h-5 text-blue-400" />
          </div>
          <span className="font-black text-base tracking-wider text-slate-100 uppercase">
            BLOCK <span className="text-blue-500">STORAGE</span>
          </span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-0.5">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.category && (
              <div className="nav-category">{section.category}</div>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href && 
                (item.href !== "/" || section.category === "" || (section.category === "SKLAD" && item.name === "Skladové zásoby"))
              
              // Special: "Přehled" is active only at root
              const isOverviewActive = item.name === "Přehled" && pathname === "/"
              const isSkladActive = item.name === "Skladové zásoby" && pathname === "/"
              const isPageActive = item.href !== "/" ? pathname === item.href : false
              const finalActive = item.name === "Přehled" ? isOverviewActive : (isPageActive || (isSkladActive && pathname === "/"))
              
              const Icon = item.icon
              return (
                <Link 
                  key={`${section.category}-${item.name}`}
                  href={item.href}
                  className={`nav-item ${finalActive ? 'nav-item-active' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${finalActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-bold bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* System Footer */}
      <div className="border-t border-white/[0.06]">
        <button 
          onClick={() => setSystemOpen(!systemOpen)}
          className="flex items-center justify-between w-full px-5 py-3 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span className="font-medium">Systém</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${systemOpen ? 'rotate-180' : ''}`} />
        </button>
        
        <div className="px-5 pb-3 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs text-emerald-400 font-medium">Všechny systémy OK</span>
        </div>
      </div>
    </aside>
  )
}
