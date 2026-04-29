"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import Sidebar from "../components/layout/Sidebar"
import Topbar from "../components/layout/Topbar"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const router = useRouter()
  const isLoginPage = pathname === '/login'

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/login')
    }
  }, [user, loading, isLoginPage, router])

  // Redirect to home if authenticated and on login page
  useEffect(() => {
    if (!loading && user && isLoginPage) {
      router.push('/')
    }
  }, [user, loading, isLoginPage, router])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Načítání BLOCK STORAGE...</p>
        </div>
      </div>
    )
  }

  // Login page — no shell
  if (isLoginPage) {
    return <>{children}</>
  }

  // Not logged in — show nothing (redirect happening)
  if (!user) {
    return null
  }

  // Authenticated — full shell
  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col pl-60 min-h-screen">
        <Topbar />
        <main className="flex-1 w-full p-6">
          {children}
        </main>
      </div>
    </>
  )
}
