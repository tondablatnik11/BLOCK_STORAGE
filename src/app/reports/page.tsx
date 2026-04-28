import { getDashboardStats, getTransferTrend } from "../../actions/inventory"
import ReportsContent from "../../components/analytics/ReportsContent"

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const [stats, transferTrend] = await Promise.all([
    getDashboardStats(),
    getTransferTrend(),
  ])
  return <ReportsContent stats={stats} transferTrend={transferTrend} />
}
