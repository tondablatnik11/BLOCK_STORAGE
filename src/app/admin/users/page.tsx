import { getAllUsers } from "../../../actions/users"
import AdminUsersContent from "../../../components/admin/AdminUsersContent"

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const users = await getAllUsers()
  return <AdminUsersContent initialUsers={users} />
}
