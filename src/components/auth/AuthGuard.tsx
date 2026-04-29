"use client"

import { useAuth } from "../../contexts/AuthContext"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login')
    }
  }, [user, loading, pathname, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Načítání...</p>
        </div>
      </div>
    )
  }

  if (!user && pathname !== '/login') {
    return null
  }

  return <>{children}</>
}
