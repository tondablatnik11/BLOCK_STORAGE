"use client"

import { useState } from "react"
import { HelpCircle, Search, ChevronDown, ChevronRight, Package, ArrowRightLeft, ClipboardCheck, Upload, Download, History, Users, Settings, Layers, MapPin, FileText, Zap } from "lucide-react"

interface HelpSection {
  id: string
  title: string
  icon: any
  color: string
  content: string[]
}

const helpSections: HelpSection[] = [
  {
    id: "start",
    title: "Rychlý start",
    icon: Zap,
    color: "text-yellow-400",
    content: [
      "1. Otevřete BLOCK STORAGE na adrese blockstorage.vercel.app",
      "2. Na hlavní stránce vidíte přehled KPI a tabulku skladových zásob.",
      "3. Použijte vyhledávací pole pro rychlé nalezení HU, materiálu nebo pozice.",
      "4. Klikněte na blok v pravém sidebaru pro zobrazení detailu bloku.",
      "5. Pro přesun do Pick skladu klikněte na ikonu šipky u záznamu v tabulce.",
      "6. Pro inventuru klikněte na ikonu clipboardu u záznamu.",
      "7. Export dat do XLSX je dostupný přes tlačítko Export XLSX nad tabulkou.",
    ]
  },
  {
    id: "terms",
    title: "Základní pojmy",
    icon: FileText,
    color: "text-blue-400",
    content: [
      "BLOCK — Fyzické místo (blok) v externím skladu, číslované 01-30.",
      "HU (Handling Unit) — Skladová jednotka s unikátním identifikátorem.",
      "Materiál — Typ zboží/produktu uloženého v HU.",
      "Pozice (Bin Location) — Přesná lokace HU uvnitř bloku.",
      "Pick sklad — Interní sklad, kam se HU přesouvají pro vychystání.",
      "Inventura — Fyzická kontrola skutečného množství vs. systémového.",
      "OK — Inventura, kde systém a fyzický stav souhlasí.",
      "NOK — Inventura, kde byl nalezen rozdíl (vyžaduje poznámku).",
      "UIH — Identifikátor uživatele provádějícího operaci.",
      "Audit log — Historie všech operací se skladovými zásobami.",
    ]
  },
  {
    id: "inventory",
    title: "Skladové zásoby",
    icon: Package,
    color: "text-emerald-400",
    content: [
      "Hlavní tabulka zobrazuje všechny aktivní skladové zásoby.",
      "Každý řádek obsahuje: BLOCK, Materiál, HU číslo, Množství, Pozici, Poznámku a stav Inventury.",
      "Kliknutím na záhlaví sloupce můžete data řadit vzestupně/sestupně.",
      "Pod záhlavím jsou filtry pro každý sloupec — zadejte text a stiskněte Enter.",
      "Při aktivních filtrech se nad tabulkou zobrazí souhrn: počet HU a celkový počet kusů.",
      "Zaškrtnutím políčka vlevo můžete vybrat záznamy pro hromadné akce.",
    ]
  },
  {
    id: "search",
    title: "Vyhledávání a filtry",
    icon: Search,
    color: "text-cyan-400",
    content: [
      "Globální vyhledávání v topbaru prohledává HU, materiál, blok i pozici.",
      "Sloupcové filtry v tabulce umožňují přesné filtrování podle jednoho nebo více kritérií.",
      "Filtry se dají kombinovat — například filtrovat BLOCK-05 + materiál XYZ.",
      "Tlačítko 'Vymazat filtry' odstraní všechny aktivní filtry najednou.",
      "Kliknutím na blok v pravém sidebaru se automaticky nastaví filtr na daný BLOCK.",
    ]
  },
  {
    id: "add",
    title: "Přidání nové HU",
    icon: Package,
    color: "text-blue-400",
    content: [
      "Klikněte na 'Přidat záznam' v levém menu nebo tlačítko + nad tabulkou.",
      "Vyplňte: BLOCK, Materiál, HU číslo, Množství, Pozici a volitelnou Poznámku.",
      "HU číslo musí být unikátní v rámci celého skladu.",
      "Po uložení se záznam okamžitě zobrazí v tabulce a zapíše do audit logu.",
    ]
  },
  {
    id: "transfer",
    title: "Přesun do Pick skladu",
    icon: ArrowRightLeft,
    color: "text-emerald-400",
    content: [
      "Přesun lze provést dvěma způsoby: přes stránku 'Přesun do Pick skladu' nebo přes ikonu v tabulce.",
      "Zadejte množství k přesunu — může být částečné (zůstatek zůstane v BLOCKu) nebo úplné.",
      "Úplný přesun (celé množství) = archivace — HU zmizí z aktivních zásob.",
      "Částečný přesun = snížení množství — HU zůstane s upraveným počtem kusů.",
      "Každý přesun vyžaduje UIH operátora a je zaznamenán v audit logu.",
    ]
  },
  {
    id: "check",
    title: "Inventura",
    icon: ClipboardCheck,
    color: "text-cyan-400",
    content: [
      "Inventuru lze zadat pro jednotlivou HU (klik na ikonu v tabulce) nebo pro celý BLOCK.",
      "Stránka 'Zadat inventuru' nabízí dva režimy: jednotlivá HU a celý BLOCK.",
      "Při inventuře zadáte fyzicky spočítané množství. Systém automaticky vyhodnotí OK/NOK.",
      "OK = systémové a fyzické množství se shoduje.",
      "NOK = existuje rozdíl — poznámka je povinná (uveďte důvod).",
      "U dávkové inventury BLOCKu se zobrazí tabulka se všemi HU a můžete editovat počty.",
      "Výsledek inventury se zobrazuje ve sloupci 'Inventura' v hlavní tabulce.",
      "Historie a analytika inventur jsou dostupné v sekci INVENTURA v levém menu.",
    ]
  },
  {
    id: "bulk",
    title: "Hromadné akce",
    icon: Layers,
    color: "text-purple-400",
    content: [
      "Zaškrtněte záznamy v tabulce pro aktivaci bottom action baru.",
      "Dostupné hromadné akce: Export XLSX, Hromadný přesun do Pick skladu, Hromadná archivace.",
      "Hromadná archivace smaže vybrané záznamy z aktivních zásob (nevratné!).",
      "Všechny hromadné akce se zaznamenávají do audit logu.",
    ]
  },
  {
    id: "import",
    title: "Import dat",
    icon: Upload,
    color: "text-orange-400",
    content: [
      "Stránka 'Import dat' přijímá soubory CSV a XLSX.",
      "Systém automaticky rozpozná sloupce (BLOCK, Materiál, HU, Množství, Pozice).",
      "Strategie pro duplicity: Přeskočit (výchozí), Aktualizovat, Nahradit.",
      "Po importu se zobrazí souhrn: kolik záznamů bylo přidáno, přeskočeno a chybových.",
      "Historie importů je dostupná v sekci HISTORIE → Import historie.",
    ]
  },
  {
    id: "export",
    title: "Export XLSX",
    icon: Download,
    color: "text-teal-400",
    content: [
      "Klikněte na 'Export XLSX' nad tabulkou pro export aktuálně zobrazených dat.",
      "Export respektuje aktivní filtry — exportují se pouze zobrazená data.",
      "XLSX soubor obsahuje dva listy: 'Skladové zásoby' (data) a 'Souhrn' (počet HU, ks, filtry, datum).",
      "Sloupce mají automatickou šířku podle obsahu.",
    ]
  },
  {
    id: "history",
    title: "Historie a audit log",
    icon: History,
    color: "text-amber-400",
    content: [
      "Audit historie zaznamenává každou operaci: přidání, editace, přesun, archivace, import.",
      "Každý záznam obsahuje: typ operace, HU, UIH operátora, starou a novou hodnotu, datum.",
      "Pohyby HU zobrazují chronologický přehled přesunů konkrétní HU.",
      "Import historie ukazuje seznam všech provedených importů s počty.",
    ]
  },
  {
    id: "roles",
    title: "Role uživatelů",
    icon: Users,
    color: "text-indigo-400",
    content: [
      "Admin — Plný přístup ke všem operacím, nastavení a správě uživatelů.",
      "Warehouse User — Přidávání, editace, přesuny, inventury. Nemůže spravovat uživatele.",
      "Readonly — Pouze čtení dat, export. Nemůže provádět žádné změny.",
      "Role se přiřazují v tabulce user_profiles v Supabase.",
    ]
  },
]

const faqItems = [
  { q: "Jak přidám nového uživatele?", a: "V Supabase Dashboard → Authentication → Users vytvořte nový účet. Poté v SQL Editoru přidejte záznam do tabulky user_profiles s příslušným UIH a rolí." },
  { q: "Mohu vrátit zpět přesun do Pick skladu?", a: "Přímé undo přesunu není k dispozici. Můžete ale ručně přidat nový záznam se stejnými údaji přes 'Přidat záznam'." },
  { q: "Co znamená NOK inventura?", a: "NOK znamená, že fyzicky spočítané množství se liší od systémového. Je povinné uvést důvod v poznámce." },
  { q: "Jak exportuji data?", a: "Klikněte na 'Export XLSX' nad tabulkou. Export respektuje aktivní filtry." },
  { q: "Mohu importovat data z Excelu?", a: "Ano, stránka Import dat přijímá soubory XLSX i CSV. Systém automaticky rozpozná sloupce." },
  { q: "Kde najdu historii změn?", a: "V levém menu → HISTORIE → Audit historie. Zde je kompletní log všech operací." },
  { q: "Jak funguje hromadná archivace?", a: "Zaškrtněte záznamy v tabulce, pak klikněte 'Hromadná archivace' v bottom baru. Tato akce je nevratná!" },
  { q: "Proč některé bloky svítí červeně?", a: "Barva bloku v pravém sidebaru indikuje vytíženost: šedá = prázdný, modrá = nízká, žlutá = střední, červená = vysoká." },
]

export default function HelpContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["start"]))
  const [openFaq, setOpenFaq] = useState<Set<number>>(new Set())

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleFaq = (idx: number) => {
    setOpenFaq(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const filtered = searchTerm.trim()
    ? helpSections.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.content.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : helpSections

  const filteredFaq = searchTerm.trim()
    ? faqItems.filter(f =>
        f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.a.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqItems

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-2 bg-indigo-500/15 rounded-xl">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Nápověda</h1>
          <p className="text-slate-500 text-sm">Kompletní průvodce aplikací BLOCK STORAGE.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Hledat v nápovědě..."
          className="w-full glass-input pl-10"
        />
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {filtered.map(section => {
          const Icon = section.icon
          const isOpen = openSections.has(section.id)
          return (
            <div key={section.id} className="glass-panel overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${section.color}`} />
                  <span className="text-sm font-bold text-white">{section.title}</span>
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-0 space-y-2 border-t border-white/[0.04]">
                  {section.content.map((line, i) => (
                    <p key={i} className="text-xs text-slate-400 leading-relaxed pl-7 py-1">{line}</p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* FAQ */}
      {filteredFaq.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white mt-8">Často kladené dotazy (FAQ)</h2>
          {filteredFaq.map((faq, idx) => {
            const isOpen = openFaq.has(idx)
            return (
              <div key={idx} className="glass-panel overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <span className="text-sm font-semibold text-slate-200 pr-4">{faq.q}</span>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-0 border-t border-white/[0.04]">
                    <p className="text-xs text-slate-400 leading-relaxed py-2">{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && filteredFaq.length === 0 && (
        <div className="text-center py-12">
          <HelpCircle className="w-8 h-8 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Žádné výsledky pro „{searchTerm}"</p>
        </div>
      )}
    </div>
  )
}
