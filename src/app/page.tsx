import KPICards from "../components/layout/KPICards"
import RightSidebar from "../components/layout/RightSidebar"
import InventoryTable from "../components/inventory/InventoryTable"
import { getActiveInventory, getKPIData, getBlockUtilization, getTransferTrend, getRecentActivities } from "../actions/inventory"

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
    <div className="animate-fade-in-up">
      {/* KPI Cards — Full width */}
      <div className="mb-6">
        <KPICards data={kpiData} />
      </div>

      {/* 3-Column Layout: Main Table + Right Sidebar */}
      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <InventoryTable initialData={inventoryData} />
        </div>

        {/* Right sidebar widgets */}
        <div className="hidden xl:block">
          <RightSidebar 
            blockUtilization={blockUtilization}
            transferTrend={transferTrend}
            recentActivities={recentActivities}
          />
        </div>
      </div>
    </div>
  )
}
