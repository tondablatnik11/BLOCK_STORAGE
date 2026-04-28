"use client"

import { useState } from "react"
import { PackagePlus, Upload } from "lucide-react"
import ImportModal from "../modals/ImportModal"
import AddRecordModal from "../modals/AddRecordModal"

export default function DashboardActions() {
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  return (
    <>
      <div className="flex gap-2">
        <button 
          onClick={() => setIsImportOpen(true)}
          className="glass-button text-xs py-2 px-3"
        >
          <Upload className="w-3.5 h-3.5" />
          Import
        </button>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="glass-button-primary text-xs py-2 px-3"
        >
          <PackagePlus className="w-3.5 h-3.5" />
          Přidat HU
        </button>
      </div>

      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <AddRecordModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </>
  )
}
