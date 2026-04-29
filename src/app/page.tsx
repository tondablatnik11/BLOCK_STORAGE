import { getActiveInventory, getKPIData, getBlockUtilization, getTransferTrend, getRecentActivities } from "../actions/inventory"
import { getLastInventoryChecks } from "../actions/inventoryChecks"
import DashboardClient from "./DashboardClient"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [inventoryData, kpiData, blockUtilization, transferTrend, recentActivities, lastChecks] = await Promise.all([
    getActiveInventory(),
    getKPIData(),
    getBlockUtilization(),
    getTransferTrend(),
    getRecentActivities(8),
    getLastInventoryChecks(),
  ])

  return (
    <DashboardClient
      inventoryData={inventoryData}
      kpiData={kpiData}
      blockUtilization={blockUtilization}
      transferTrend={transferTrend}
      recentActivities={recentActivities}
      lastChecks={lastChecks}
    />
  )
}
