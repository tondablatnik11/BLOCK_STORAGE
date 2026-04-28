import { getDashboardStats, getTransferTrend } from "../../actions/inventory"
import DashboardContent from "../../components/analytics/DashboardContent"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [stats, transferTrend] = await Promise.all([
    getDashboardStats(),
    getTransferTrend(),
  ])

  return <DashboardContent stats={stats} transferTrend={transferTrend} />
}
