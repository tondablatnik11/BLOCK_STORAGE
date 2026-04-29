import { getInventoryCheckHistory } from "../../../actions/inventoryChecks"
import InventoryCheckHistoryContent from "../../../components/inventory-checks/InventoryCheckHistoryContent"

export const dynamic = 'force-dynamic'

export default async function InventoryCheckHistoryPage() {
  const checks = await getInventoryCheckHistory()
  return <InventoryCheckHistoryContent initialChecks={checks} />
}
