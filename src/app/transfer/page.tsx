import { getActiveInventory } from "../../actions/inventory"
import TransferContent from "../../components/operations/TransferContent"

export const dynamic = 'force-dynamic'

export default async function TransferPage() {
  const inventory = await getActiveInventory()
  return <TransferContent inventory={inventory} />
}
