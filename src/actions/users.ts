"use server"

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

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

export async function getAllUsers(): Promise<UserProfileRow[]> {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getAllUsers error:', error)
    return []
  }

  return (data || []) as UserProfileRow[]
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'warehouse_user' | 'readonly') {
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true, message: `Role změněna na ${newRole}` }
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true, message: isActive ? 'Uživatel aktivován' : 'Uživatel deaktivován' }
}
