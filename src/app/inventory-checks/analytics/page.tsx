import { getInventoryCheckAnalytics } from "../../../actions/inventoryChecks"
import InventoryCheckAnalyticsContent from "../../../components/inventory-checks/InventoryCheckAnalyticsContent"

export const dynamic = 'force-dynamic'

export default async function InventoryCheckAnalyticsPage() {
  const analytics = await getInventoryCheckAnalytics()
  return <InventoryCheckAnalyticsContent analytics={analytics} />
}
