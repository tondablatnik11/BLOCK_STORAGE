"use client"

import { useState } from "react"
import { Users, Shield, ShieldCheck, Eye, UserCheck, UserX, RefreshCw } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "sonner"

interface Props {
  initialUsers: UserProfileRow[]
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  warehouse_user: 'Skladník',
  readonly: 'Pouze čtení',
}

const roleColors: Record<string, string> = {
  admin: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  warehouse_user: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  readonly: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

const roleIcons: Record<string, any> = {
  admin: ShieldCheck,
  warehouse_user: UserCheck,
  readonly: Eye,
}

import { supabaseBrowser } from "../../lib/supabase-browser"
import { useEffect } from "react"

export interface UserProfileRow {
  id: string
  auth_id: string
  email: string
  uih: string
  full_name: string | null
  role: 'admin' | 'warehouse_user' | 'readonly'
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export default function AdminUsersContent({ initialUsers }: Props) {
  const { profile } = useAuth()
  const [users, setUsers] = useState<UserProfileRow[]>(initialUsers)
  const [loading, setLoading] = useState<string | null>(null)

  const isAdmin = profile?.role === 'admin'

  const handleRefresh = async () => {
    setLoading('refresh')
    const { data } = await supabaseBrowser
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setUsers(data as UserProfileRow[])
    setLoading(null)
  }

  // Load users on mount if initial array is empty (which happens due to server action RLS)
  useEffect(() => {
    if (isAdmin && users.length === 0) {
      handleRefresh()
    }
  }, [isAdmin])

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'warehouse_user' | 'readonly') => {
    setLoading(userId)
    const { error } = await supabaseBrowser
      .from('user_profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (!error) {
      toast.success(`Role změněna na ${roleLabels[newRole]}`)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } else {
      toast.error('Chyba: Nedostatečná práva (zkontrolujte RLS v Supabase)')
    }
    setLoading(null)
  }

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    setLoading(userId)
    const { error } = await supabaseBrowser
      .from('user_profiles')
      .update({ is_active: !currentActive, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (!error) {
      toast.success(!currentActive ? 'Uživatel aktivován' : 'Uživatel deaktivován')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u))
    } else {
      toast.error('Chyba: Nedostatečná práva (zkontrolujte RLS v Supabase)')
    }
    setLoading(null)
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-3">
          <Shield className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Přístup odepřen</h2>
          <p className="text-sm text-slate-500">Tato stránka je dostupná pouze pro administrátory.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-amber-500/15 rounded-xl">
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Správa uživatelů</h1>
            <p className="text-slate-500 text-sm">{users.length} registrovaných uživatelů</p>
          </div>
        </div>
        <button onClick={handleRefresh} disabled={loading === 'refresh'} className="glass-button text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${loading === 'refresh' ? 'animate-spin' : ''}`} />
          Obnovit
        </button>
      </div>

      {/* Users table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#060d1b] border-b border-white/[0.08]">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Uživatel</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">UIH</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Role</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Stav</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Poslední přihlášení</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registrace</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {users.map(user => {
                const RoleIcon = roleIcons[user.role]
                const isSelf = profile?.uih === user.uih
                const isLoading = loading === user.id
                return (
                  <tr key={user.id} className={`glass-table-row ${!user.is_active ? 'opacity-40' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                          {(user.full_name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{user.full_name || '—'}</p>
                          <p className="text-[10px] text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-bold text-blue-400">{user.uih}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border ${roleColors[user.role]}`}>
                        <RoleIcon className="w-3 h-3" />
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.is_active ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Aktivní</span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Neaktivní</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {user.last_login_at 
                        ? new Date(user.last_login_at).toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {new Date(user.created_at).toLocaleDateString('cs-CZ')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Role selector */}
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                          disabled={isLoading || isSelf}
                          className="bg-[#060d1b] border border-white/[0.08] rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500/30 disabled:opacity-30"
                          title={isSelf ? 'Nemůžete měnit vlastní roli' : 'Změnit roli'}
                        >
                          <option value="admin">Admin</option>
                          <option value="warehouse_user">Skladník</option>
                          <option value="readonly">Pouze čtení</option>
                        </select>

                        {/* Active/Inactive toggle */}
                        <button
                          onClick={() => handleToggleActive(user.id, user.is_active)}
                          disabled={isLoading || isSelf}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${
                            user.is_active 
                              ? 'text-red-400 hover:bg-red-500/10' 
                              : 'text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                          title={isSelf ? 'Nemůžete deaktivovat sebe' : user.is_active ? 'Deaktivovat' : 'Aktivovat'}
                        >
                          {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-panel p-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Popis rolí</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-400">Admin</p>
              <p className="text-[10px] text-slate-500">Plný přístup, správa uživatelů, nastavení</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-400">Skladník</p>
              <p className="text-[10px] text-slate-500">CRUD operace, inventury, přesuny</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Eye className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-400">Pouze čtení</p>
              <p className="text-[10px] text-slate-500">Zobrazení dat a export, žádné změny</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
