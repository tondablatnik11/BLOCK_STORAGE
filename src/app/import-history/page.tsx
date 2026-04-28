import { getImportHistory } from "../../actions/inventory"
import ImportHistoryContent from "../../components/history/ImportHistoryContent"

export const dynamic = 'force-dynamic'

export default async function ImportHistoryPage() {
  const imports = await getImportHistory()
  return <ImportHistoryContent initialData={imports} />
}
