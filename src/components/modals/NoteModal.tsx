"use client"

import { useState, useEffect } from "react"
import { X, MessageSquare, Send, Clock, User, Loader2 } from "lucide-react"
import { InventoryRecord } from "../../types/app"
import { getInventoryNotes, addInventoryNote, InventoryNote } from "../../actions/notes"
import { toast } from "sonner"

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  record: InventoryRecord | null
}

export default function NoteModal({ isOpen, onClose, record }: NoteModalProps) {
  const [notes, setNotes] = useState<InventoryNote[]>([])
  const [newNote, setNewNote] = useState("")
  const [uih, setUih] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && record) {
      setLoading(true)
      setNewNote("")
      getInventoryNotes(record.id).then(data => {
        setNotes(data)
        setLoading(false)
      })
    }
  }, [isOpen, record])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!record || !newNote.trim() || !uih.trim()) return

    setSubmitting(true)
    const result = await addInventoryNote(record.id, record.hu_number, newNote.trim(), uih.trim())
    setSubmitting(false)

    if (result.success) {
      toast.success("Poznámka uložena")
      setNewNote("")
      // Refresh notes
      const updated = await getInventoryNotes(record.id)
      setNotes(updated)
    } else {
      toast.error(result.error || "Chyba při ukládání")
    }
  }

  if (!isOpen || !record) return null

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('cs-CZ', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
        <div className="bg-[#0a1628] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/15 rounded-xl">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Poznámky</h2>
                  <p className="text-xs text-slate-500 font-mono">{record.hu_number}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Record context */}
            <div className="mt-3 flex gap-3 text-[11px] text-slate-500">
              <span className="bg-[#060d1b] px-2 py-1 rounded-lg border border-white/[0.06]">{record.block}</span>
              <span className="bg-[#060d1b] px-2 py-1 rounded-lg border border-white/[0.06]">{record.material}</span>
              <span className="bg-[#060d1b] px-2 py-1 rounded-lg border border-white/[0.06]">{record.bin_location}</span>
            </div>
          </div>

          {/* Current note */}
          {record.notes && (
            <div className="px-5 py-3 bg-amber-500/5 border-b border-white/[0.06]">
              <p className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider mb-1">Aktuální poznámka</p>
              <p className="text-sm text-slate-200">{record.notes}</p>
            </div>
          )}

          {/* Notes history */}
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-5 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Načítám historii...</span>
              </div>
            ) : notes.length > 0 ? (
              <>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Historie poznámek ({notes.length})</p>
                {notes.map((note) => (
                  <div key={note.id} className="bg-[#060d1b] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-sm text-slate-200 leading-relaxed">{note.note}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {note.created_by_uih}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-center text-sm text-slate-600 py-4">Zatím žádné poznámky</p>
            )}
          </div>

          {/* Add new note form */}
          <form onSubmit={handleSubmit} className="p-5 border-t border-white/[0.06] space-y-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Napište novou poznámku..."
              rows={2}
              className="w-full bg-[#060d1b] border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none"
            />
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={uih}
                onChange={(e) => setUih(e.target.value)}
                placeholder="Vaše UIH"
                className="glass-input text-xs flex-1 uppercase"
                required
              />
              <button
                type="submit"
                disabled={submitting || !newNote.trim() || !uih.trim()}
                className="glass-button-primary text-xs py-2 px-4 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Ukládám...' : 'Uložit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
