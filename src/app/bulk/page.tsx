import { getActiveInventory } from "../../actions/inventory"
import BulkContent from "../../components/operations/BulkContent"

export const dynamic = 'force-dynamic'

export default async function BulkPage() {
  const inventory = await getActiveInventory()
  return <BulkContent inventory={inventory} />
}
