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
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data } = await supabaseBrowser
      .from('user_profiles')
      .select('*')
      .eq('auth_id', userId)
      .single()

    if (data) {
      setProfile(data as UserProfile)

      // Update last_login_at
      await supabaseBrowser
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('auth_id', userId)
    }
  }

  useEffect(() => {
    // Get initial session
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
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

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
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
    if (user) await fetchProfile(user.id)
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
