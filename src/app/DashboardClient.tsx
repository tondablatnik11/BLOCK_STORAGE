"use client"

import { useState } from "react"
import InventoryTable from "../components/inventory/InventoryTable"
import RightSidebar from "../components/layout/RightSidebar"
import KPICards from "../components/layout/KPICards"

interface DashboardClientProps {
  inventoryData: any[]
  kpiData: any
  blockUtilization: Record<string, number>
  transferTrend: { date: string; count: number }[]
  recentActivities: any[]
}

export default function DashboardClient({
  inventoryData,
  kpiData,
  blockUtilization,
  transferTrend,
  recentActivities,
}: DashboardClientProps) {
  const [externalBlockFilter, setExternalBlockFilter] = useState<string>("")

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
          <InventoryTable 
            initialData={inventoryData} 
            externalBlockFilter={externalBlockFilter}
          />
        </div>

        {/* Right sidebar widgets */}
        <div className="hidden xl:block">
          <RightSidebar 
            blockUtilization={blockUtilization}
            transferTrend={transferTrend}
            recentActivities={recentActivities}
            onFilterBlock={(block) => setExternalBlockFilter(block)}
          />
        </div>
      </div>
    </div>
  )
}
