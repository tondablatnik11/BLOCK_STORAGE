import { getActiveInventory, getKPIData, getBlockUtilization, getTransferTrend, getRecentActivities } from "../actions/inventory"
import DashboardClient from "./DashboardClient"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [inventoryData, kpiData, blockUtilization, transferTrend, recentActivities] = await Promise.all([
    getActiveInventory(),
    getKPIData(),
    getBlockUtilization(),
    getTransferTrend(),
    getRecentActivities(8),
  ])

  return (
    <DashboardClient
      inventoryData={inventoryData}
      kpiData={kpiData}
      blockUtilization={blockUtilization}
      transferTrend={transferTrend}
      recentActivities={recentActivities}
    />
  )
}
