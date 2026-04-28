import { getHUMovements } from "../../actions/inventory"
import MovementsContent from "../../components/history/MovementsContent"

export const dynamic = 'force-dynamic'

export default async function MovementsPage() {
  const movements = await getHUMovements()
  return <MovementsContent initialData={movements} />
}
