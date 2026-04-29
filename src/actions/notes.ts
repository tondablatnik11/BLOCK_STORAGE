"use server"

import { supabase } from "../lib/supabase"
import { revalidatePath } from "next/cache"
import { BaseActionResponse } from "../types/app"

// Typ pro poznámku
export interface InventoryNote {
  id: string
  inventory_id: string
  hu_number: string
  note: string
  created_by_uih: string
  created_at: string
  updated_by_uih: string | null
  updated_at: string | null
}

// Získat historii poznámek pro inventární záznam
export async function getInventoryNotes(inventoryId: string): Promise<InventoryNote[]> {
  const { data, error } = await (supabase as any)
    .from('inventory_notes')
    .select('*')
    .eq('inventory_id', inventoryId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error("Chyba při načítání poznámek:", error)
    return []
  }

  return data || []
}

// Přidat novou poznámku
export async function addInventoryNote(
  inventoryId: string,
  huNumber: string,
  note: string,
  uih: string
): Promise<BaseActionResponse> {
  if (!note.trim()) {
    return { success: false, error: "Poznámka nesmí být prázdná." }
  }
  if (!uih.trim()) {
    return { success: false, error: "UIH je povinné." }
  }

  // 1. Uložit poznámku do history
  const { error: noteError } = await (supabase as any)
    .from('inventory_notes')
    .insert({
      inventory_id: inventoryId,
      hu_number: huNumber,
      note: note.trim(),
      created_by_uih: uih.trim().toUpperCase()
    })

  if (noteError) {
    return { success: false, error: `Chyba při ukládání poznámky: ${noteError.message}` }
  }

  // 2. Aktualizovat inventory.notes (poslední aktuální poznámka)
  const { data: current } = await (supabase as any)
    .from('inventory')
    .select('notes')
    .eq('id', inventoryId)
    .single()

  const oldNote = current?.notes || null

  const { error: updateError } = await (supabase as any)
    .from('inventory')
    .update({ notes: note.trim() })
    .eq('id', inventoryId)

  if (updateError) {
    return { success: false, error: `Chyba při aktualizaci záznamu: ${updateError.message}` }
  }

  // 3. Audit log
  await (supabase as any)
    .from('history_logs')
    .insert({
      uih: uih.trim().toUpperCase(),
      inventory_id: inventoryId,
      hu_number: huNumber,
      action: 'update_note',
      old_value: oldNote ? { notes: oldNote } : null,
      new_value: { notes: note.trim() },
      notes: `Poznámka přidána přes note modal`
    })

  revalidatePath('/')
  return { success: true, message: "Poznámka uložena." }
}
