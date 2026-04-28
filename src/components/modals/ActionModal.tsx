"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

interface ActionModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  variant?: 'default' | 'blue' | 'indigo' | 'green' | 'cyan' | 'red' | 'amber'
}

export default function ActionModal({ isOpen, onClose, title, children, variant = 'default' }: ActionModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getVariantGradient = () => {
    switch (variant) {
      case 'blue': return 'from-blue-500 to-blue-600'
      case 'indigo': return 'from-indigo-500 to-indigo-600'
      case 'green': return 'from-emerald-500 to-emerald-600'
      case 'cyan': return 'from-cyan-500 to-cyan-600'
      case 'red': return 'from-red-500 to-red-600'
      case 'amber': return 'from-amber-500 to-amber-600'
      default: return 'from-slate-600 to-slate-700'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#0B1220] border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barevná identifikační linka podle typu akce */}
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${getVariantGradient()}`}></div>
        
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#111827]">
          <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
            title="Zavřít"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
