"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { LogOut, User, Shield, ChevronDown, Copy, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function UserMenu() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const handleCopyUIH = () => {
    if (profile?.uih) {
      navigator.clipboard.writeText(profile.uih)
      setCopied(true)
      toast.success(`UIH ${profile.uih} zkopírováno`)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center gap-2.5 py-1.5 px-2">
        <div className="w-8 h-8 rounded-full bg-slate-700/30 border border-slate-600/20 animate-pulse" />
      </div>
    )
  }

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    warehouse_user: 'Skladník',
    readonly: 'Pouze čtení',
  }

  const roleColors: Record<string, string> = {
    admin: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    warehouse_user: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    readonly: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  }

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : profile.email[0].toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 hover:bg-white/[0.04] py-1.5 px-2 rounded-lg transition-all"
      >
        <div className="flex flex-col text-right">
          <span className="text-xs font-bold text-slate-200 leading-none">
            {profile.full_name || profile.email.split('@')[0]}
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5">{profile.uih}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm shadow-[0_0_8px_rgba(59,130,246,0.1)]">
          {initials}
        </div>
        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#0a1628] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User info */}
          <div className="p-4 border-b border-white/[0.06]">
            <p className="text-sm font-bold text-white">{profile.full_name || 'Uživatel'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleColors[profile.role]}`}>
                {roleLabels[profile.role]}
              </span>
              <button 
                onClick={handleCopyUIH}
                className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-blue-400 font-mono transition-colors"
                title="Kopírovat UIH"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {profile.uih}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Odhlásit se
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
