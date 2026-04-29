import { getActiveInventory } from "../../../actions/inventory"
import InventoryCheckNewContent from "../../../components/inventory-checks/InventoryCheckNewContent"

export const dynamic = 'force-dynamic'

export default async function InventoryCheckNewPage() {
  const inventory = await getActiveInventory()
  return <InventoryCheckNewContent inventory={inventory} />
}
