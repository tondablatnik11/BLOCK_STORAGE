"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Box, LogIn, UserPlus, Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react"

type Mode = 'login' | 'register'

// Generování interního emailu z UIH: "UIH001" → "uih001@blockstorage.app"
function uihToEmail(uih: string): string {
  return `${uih.toLowerCase().trim()}@blockstorage.app`
}

export default function LoginPage() {
  const { signIn, signUp, loading } = useAuth()
  const router = useRouter()

  const [mode, setMode] = useState<Mode>('login')
  const [loginUih, setLoginUih] = useState("")
  const [regName, setRegName] = useState("")
  const [regUih, setRegUih] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!password.trim() || password.length < 6) {
      setError("Heslo musí mít alespoň 6 znaků.")
      return
    }

    setSubmitting(true)

    if (mode === 'login') {
      if (!loginUih.trim()) {
        setError("Vyplňte vaše UIH.")
        setSubmitting(false)
        return
      }
      const email = uihToEmail(loginUih)
      const res = await signIn(email, password)
      if (res.success) {
        router.push('/')
        router.refresh()
      } else {
        setError("Neplatné UIH nebo heslo.")
      }
    } else {
      if (!regName.trim()) {
        setError("Vyplňte jméno.")
        setSubmitting(false)
        return
      }
      if (!regUih.trim()) {
        setError("Vyplňte vaše UIH.")
        setSubmitting(false)
        return
      }
      const email = uihToEmail(regUih)
      const res = await signUp(email, password, regName.trim(), regUih.trim().toUpperCase())
      if (res.success) {
        setSuccess("Registrace úspěšná! Nyní se přihlaste pomocí UIH a hesla.")
        setMode('login')
        setLoginUih(regUih)
      } else {
        if (res.error?.includes('already') || res.error?.includes('duplicate')) {
          setError("Toto UIH je již registrováno.")
        } else {
          setError(res.error || "Registrace selhala.")
        }
      }
    }

    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#050a18] flex items-center justify-center z-[100]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#050a18] flex items-center justify-center z-[100]">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(100,150,255,0.3) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/[0.04] rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 mb-4">
            <Box className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">BLOCK STORAGE</h1>
          <p className="text-sm text-slate-500 mt-1">Přehled a správa externího skladu</p>
        </div>

        {/* Form card */}
        <div className="bg-[#0a1628] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/[0.06]">
            <button
              onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                mode === 'login' 
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/[0.05]' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <LogIn className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Přihlášení
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); setSuccess(null) }}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${
                mode === 'register' 
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/[0.05]' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <UserPlus className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Registrace
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            {/* === LOGIN MODE === */}
            {mode === 'login' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vaše UIH *</label>
                <input
                  type="text"
                  value={loginUih}
                  onChange={(e) => setLoginUih(e.target.value.toUpperCase())}
                  placeholder="Např. UIH001"
                  className="glass-input uppercase font-mono text-lg tracking-wider"
                  required
                  autoFocus
                />
              </div>
            )}

            {/* === REGISTER MODE === */}
            {mode === 'register' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jméno a příjmení *</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Jan Novák"
                    className="glass-input"
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vaše UIH (z SAPu) *</label>
                  <input
                    type="text"
                    value={regUih}
                    onChange={(e) => setRegUih(e.target.value.toUpperCase())}
                    placeholder="Např. UIH001"
                    className="glass-input uppercase font-mono"
                    required
                  />
                  <p className="text-[10px] text-slate-600">Zadejte stejné UIH, které používáte v SAPu.</p>
                </div>
              </>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Heslo *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl">
                <p className="text-xs text-emerald-300">{success}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'login' ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {submitting ? 'Počkejte...' : mode === 'login' ? 'Přihlásit se' : 'Zaregistrovat se'}
            </button>

            {/* Info */}
            {mode === 'register' && (
              <p className="text-[10px] text-slate-600 text-center leading-relaxed">
                Zadejte své jméno, UIH z SAPu a zvolte heslo.
                <br />Pro přihlášení pak stačí UIH + heslo.
              </p>
            )}
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-700 mt-6">
          BLOCK STORAGE v2.0 · Powered by Supabase
        </p>
      </div>
    </div>
  )
}
