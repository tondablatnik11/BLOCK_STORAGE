import { getHistoryLogs } from "../../actions/history"
import HistoryTable from "../../components/history/HistoryTable"
import { ScrollText } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const logs = await getHistoryLogs()

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <div className="flex items-center gap-2 text-amber-400 mb-1">
          <ScrollText className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Historie</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Audit historie</h1>
        <p className="text-slate-500 mt-1 text-sm">Auditní log veškerých akcí, přesunů a úprav v aplikaci.</p>
      </div>

      <HistoryTable initialData={logs} />
    </div>
  )
}
