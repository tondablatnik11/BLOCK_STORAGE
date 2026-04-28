import { getDashboardStats } from "../../actions/inventory"
import StatisticsContent from "../../components/analytics/StatisticsContent"

export const dynamic = 'force-dynamic'

export default async function StatisticsPage() {
  const stats = await getDashboardStats()
  return <StatisticsContent stats={stats} />
}
