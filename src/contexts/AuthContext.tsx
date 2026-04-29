"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabaseBrowser } from "../lib/supabase-browser"
import { User, Session } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  auth_id: string
  email: string
  uih: string
  full_name: string | null
  role: 'admin' | 'warehouse_user' | 'readonly'
  is_active: boolean
  last_login_at: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, fullName: string, uih?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (authUser: User) => {
    const { data, error } = await supabaseBrowser
      .from('user_profiles')
      .select('*')
      .eq('auth_id', authUser.id)
      .maybeSingle()

    if (data) {
      setProfile(data as UserProfile)

      // Update last_login_at
      await supabaseBrowser
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('auth_id', authUser.id)
    } else {
      // Trigger pravděpodobně selhal — vytvoříme profil ručně
      const meta = authUser.user_metadata || {}
      const customUih = meta.custom_uih || ''
      const fullName = meta.full_name || authUser.email?.split('@')[0] || 'User'
      
      // Počkat krátce, trigger mohl ještě nedoběhnout
      await new Promise(r => setTimeout(r, 1000))
      
      // Zkusit znovu
      const { data: retryData } = await supabaseBrowser
        .from('user_profiles')
        .select('*')
        .eq('auth_id', authUser.id)
        .maybeSingle()
      
      if (retryData) {
        setProfile(retryData as UserProfile)
      } else {
        // Stále neexistuje — vytvořit fallback profil
        const fallbackProfile: UserProfile = {
          id: '',
          auth_id: authUser.id,
          email: authUser.email || '',
          uih: customUih || 'N/A',
          full_name: fullName,
          role: 'warehouse_user',
          is_active: true,
          last_login_at: null,
        }
        setProfile(fallbackProfile)
        console.warn('User profile not found in DB, using fallback. Run 004_user_profiles.sql migration.')
      }
    }
  }

  useEffect(() => {
    // Get initial session
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password })
    if (error) {
      return { success: false, error: error.message === 'Invalid login credentials' 
        ? 'Neplatný email nebo heslo.' 
        : error.message }
    }
    return { success: true }
  }

  const signUp = async (email: string, password: string, fullName: string, uih?: string) => {
    const { error } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, custom_uih: uih || '' } }
    })
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  }

  const signOut = async () => {
    await supabaseBrowser.auth.signOut()
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user)
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
