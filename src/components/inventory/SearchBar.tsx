"use client"

import { Search, X } from "lucide-react"
import { useEffect, useRef } from "react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Automatický focus po načtení pro okamžité použití se čtečkou
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-slate-500" />
      </div>
      <input
        ref={inputRef}
        type="text"
        className="glass-input pl-10 pr-10 py-2.5 text-sm"
        placeholder="Vyhledat v tabulce..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
          title="Vymazat vyhledávání"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
