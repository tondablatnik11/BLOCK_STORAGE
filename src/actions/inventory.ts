"use server"

import { supabase } from "../lib/supabase"
import { BaseActionResponse, KPIDashboard, AuditAction, InventoryRecord } from "../types/app"
import { revalidatePath } from "next/cache"

// Pomocná funkce pro zápis do Audit Logu
async function logAction(
  uih: string,
  inventory_id: string | null,
  hu_number: string,
  action: AuditAction,
  old_value: any = null,
  new_value: any = null,
  notes: string | null = null
) {
  const payload = {
    uih,
    inventory_id,
    hu_number,
    action,
    old_value,
    new_value,
    notes
  }

  const { error } = await (supabase as any).from('history_logs').insert(payload)
  
  if (error) {
    console.error("Chyba při zápisu do historie:", error)
  }
}

// Dynamické KPI podle období
export async function getKPIData(period: 'day' | 'week' | 'month' = 'day'): Promise<any> {
  const { data: viewData, error } = await (supabase as any)
    .from('kpi_dashboard')
    .select('*')
    .single()

  if (error) {
    console.error("Chyba při načítání KPI:", error)
    return null
  }

  // Získáme počet HU v nejplnějším bloku
  let mostFilledBlockCount: number | null = null
  if (viewData?.most_filled_block) {
    const { count } = await (supabase as any)
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('block', viewData.most_filled_block)
    mostFilledBlockCount = count
  }

  return { ...viewData, most_filled_block_count: mostFilledBlockCount }
}

// ═══════════════════════════════════════════════
// VYTÍŽENOST BLOKŮ — Počet HU na každém bloku
// ═══════════════════════════════════════════════
export async function getBlockUtilization(): Promise<Record<string, number>> {
  const { data, error } = await (supabase as any)
    .from('inventory')
    .select('block')
    .eq('status', 'active')

  if (error) {
    console.error("Chyba při načítání vytíženosti bloků:", error)
    return {}
  }

  const counts: Record<string, number> = {}
  ;(data || []).forEach((row: any) => {
    counts[row.block] = (counts[row.block] || 0) + 1
  })
  return counts
}

// ═══════════════════════════════════════════════
// DETAIL BLOKU — Souhrn materiálů v jednom bloku
// ═══════════════════════════════════════════════
export interface BlockMaterialItem {
  material: string
  hu_count: number
  total_quantity: number
  bin_count: number
  last_updated: string
}

export interface BlockSummary {
  block: string
  total_hu: number
  total_quantity: number
  unique_materials: number
  materials: BlockMaterialItem[]
}

export async function getBlockMaterialSummary(block: string): Promise<BlockSummary> {
  const { data, error } = await (supabase as any)
    .from('inventory')
    .select('material, quantity, bin_location, updated_at')
    .eq('status', 'active')
    .eq('block', block)
    .order('updated_at', { ascending: false })

  if (error || !data) {
    return { block, total_hu: 0, total_quantity: 0, unique_materials: 0, materials: [] }
  }

  const materialMap = new Map<string, { hu_count: number; total_quantity: number; bins: Set<string>; last_updated: string }>()

  data.forEach((row: any) => {
    const existing = materialMap.get(row.material)
    if (existing) {
      existing.hu_count++
      existing.total_quantity += row.quantity
      existing.bins.add(row.bin_location)
      if (row.updated_at > existing.last_updated) existing.last_updated = row.updated_at
    } else {
      materialMap.set(row.material, {
        hu_count: 1,
        total_quantity: row.quantity,
        bins: new Set([row.bin_location]),
        last_updated: row.updated_at
      })
    }
  })

  const materials: BlockMaterialItem[] = Array.from(materialMap.entries())
    .map(([material, info]) => ({
      material,
      hu_count: info.hu_count,
      total_quantity: info.total_quantity,
      bin_count: info.bins.size,
      last_updated: info.last_updated
    }))
    .sort((a, b) => b.hu_count - a.hu_count)

  return {
    block,
    total_hu: data.length,
    total_quantity: data.reduce((sum: number, r: any) => sum + r.quantity, 0),
    unique_materials: materialMap.size,
    materials
  }
}

// ═══════════════════════════════════════════════
// PŘESUNY DO PICK SKLADU — Denní agregace za posledních 7 dní
// ═══════════════════════════════════════════════
export async function getTransferTrend(): Promise<{ date: string; count: number }[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  
  const { data, error } = await (supabase as any)
    .from('history_logs')
    .select('created_at')
    .in('action', ['partial_transfer', 'full_transfer'])
    .gte('created_at', sevenDaysAgo)

  if (error) {
    console.error("Chyba při načítání trendu přesunů:", error)
    return []
  }

  // Agregace po dnech
  const dayMap: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = `${d.getDate()}.${d.getMonth() + 1}.`
    dayMap[key] = 0
  }

  ;(data || []).forEach((row: any) => {
    const d = new Date(row.created_at)
    const key = `${d.getDate()}.${d.getMonth() + 1}.`
    if (dayMap[key] !== undefined) dayMap[key]++
  })

  return Object.entries(dayMap).map(([date, count]) => ({ date, count }))
}

// ═══════════════════════════════════════════════
// POSLEDNÍ AKTIVITY — Feed posledních N akcí
// ═══════════════════════════════════════════════
export async function getRecentActivities(limit: number = 8): Promise<any[]> {
  const { data, error } = await (supabase as any)
    .from('history_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Chyba při načítání posledních aktivit:", error)
    return []
  }

  return data || []
}

// ═══════════════════════════════════════════════
// DASHBOARD STATISTIKY — Agregovaná data pro analytiku
// ═══════════════════════════════════════════════
export async function getDashboardStats(): Promise<any> {
  // Celkový počet aktivních HU
  const { count: activeCount } = await (supabase as any)
    .from('inventory')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Celkový počet archivovaných
  const { count: archivedCount } = await (supabase as any)
    .from('inventory')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'archived')

  // Přesuny dnes
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  
  const { count: transfersToday } = await (supabase as any)
    .from('history_logs')
    .select('*', { count: 'exact', head: true })
    .in('action', ['partial_transfer', 'full_transfer'])
    .gte('created_at', todayStart.toISOString())

  // Přesuny tento měsíc
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { count: transfersMonth } = await (supabase as any)
    .from('history_logs')
    .select('*', { count: 'exact', head: true })
    .in('action', ['partial_transfer', 'full_transfer'])
    .gte('created_at', monthStart.toISOString())

  // Import logy
  const { count: importsMonth } = await (supabase as any)
    .from('history_logs')
    .select('*', { count: 'exact', head: true })
    .eq('action', 'import')
    .gte('created_at', monthStart.toISOString())

  // Top materiály
  const { data: materialData } = await (supabase as any)
    .from('inventory')
    .select('material')
    .eq('status', 'active')

  const materialCounts: Record<string, number> = {}
  ;(materialData || []).forEach((row: any) => {
    materialCounts[row.material] = (materialCounts[row.material] || 0) + 1
  })
  const topMaterials = Object.entries(materialCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  // Unikátní bloky a jejich HU
  const blockUtilization = await getBlockUtilization()
  const activeBlocks = Object.keys(blockUtilization).length

  // Akce za posledních 30 dní po dnech
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: monthlyActions } = await (supabase as any)
    .from('history_logs')
    .select('created_at, action')
    .gte('created_at', thirtyDaysAgo)

  const dailyActions: Record<string, number> = {}
  ;(monthlyActions || []).forEach((row: any) => {
    const d = new Date(row.created_at)
    const key = `${d.getDate()}.${d.getMonth() + 1}.`
    dailyActions[key] = (dailyActions[key] || 0) + 1
  })

  return {
    activeCount: activeCount || 0,
    archivedCount: archivedCount || 0,
    transfersToday: transfersToday || 0,
    transfersMonth: transfersMonth || 0,
    importsMonth: importsMonth || 0,
    topMaterials,
    activeBlocks,
    blockUtilization,
    dailyActions: Object.entries(dailyActions).map(([date, count]) => ({ date, count }))
  }
}

// ═══════════════════════════════════════════════
// IMPORT HISTORIE — Logy z importů
// ═══════════════════════════════════════════════
export async function getImportHistory(): Promise<any[]> {
  const { data, error } = await (supabase as any)
    .from('history_logs')
    .select('*')
    .eq('action', 'import')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error("Chyba při načítání import historie:", error)
    return []
  }

  return data || []
}

// ═══════════════════════════════════════════════
// POHYBY HU — Historie konkrétní HU
// ═══════════════════════════════════════════════
export async function getHUMovements(): Promise<any[]> {
  const { data, error } = await (supabase as any)
    .from('history_logs')
    .select('*')
    .in('action', ['partial_transfer', 'full_transfer', 'update_bin', 'update_quantity'])
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error("Chyba při načítání pohybů HU:", error)
    return []
  }

  return data || []
}

// Načtení aktivního skladu
export async function getActiveInventory(): Promise<InventoryRecord[]> {
  const { data, error } = await (supabase as any)
    .from('inventory')
    .select('*')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error("Chyba při načítání inventáře:", error)
    return []
  }
  
  return data || []
}

// FUNKCE UNDO: Navrácení stavu v historii
export async function undoHistoryAction(logId: string, uih: string): Promise<BaseActionResponse> {
  if (!uih) return { success: false, error: "Administrátorské UIH je vyžadováno." }

  // 1. Načtení logu
  const { data: log, error: logError } = await (supabase as any)
    .from('history_logs')
    .select('*')
    .eq('id', logId)
    .single()
    
  if (logError || !log || !log.inventory_id || !log.old_value) {
    return { success: false, error: "Tento krok nelze vrátit (chybí stará data nebo ID)." }
  }

  // 2. Rekonstrukce starých dat
  const oldVal = log.old_value as any
  const updateData: any = { status: 'active' } // Undo vždy vrací do aktivního stavu
  
  if (oldVal.quantity !== undefined) updateData.quantity = oldVal.quantity
  if (oldVal.bin_location !== undefined) updateData.bin_location = oldVal.bin_location

  // 3. Update záznamu
  const { error } = await (supabase as any)
    .from('inventory')
    .update(updateData)
    .eq('id', log.inventory_id)
    
  if (error) return { success: false, error: error.message }

  // 4. Zápis o UNDO do historie
  await (supabase as any).from('history_logs').insert({
    uih,
    inventory_id: log.inventory_id,
    hu_number: log.hu_number,
    action: 'update_quantity', // Technicky jde o úpravu zpět
    notes: `UNDO akce: ${logId} (Uživatel: ${uih})`,
    new_value: updateData
  })

  revalidatePath('/')
  revalidatePath('/history')
  return { success: true, message: "Akce byla úspěšně vrácena zpět." }
}

// Přidání nové HU
export async function addInventoryRecord(
  uih: string,
  block: string,
  material: string,
  hu_number: string,
  quantity: number,
  bin_location: string,
  notes?: string
): Promise<BaseActionResponse> {
  if (!uih) return { success: false, error: "UIH je povinné." }
  if (quantity < 0) return { success: false, error: "Množství nesmí být záporné." }

  const payload = {
    block,
    material,
    hu_number,
    quantity,
    bin_location,
    notes: notes || null,
    status: 'active'
  }

  const { data, error } = await (supabase as any)
    .from('inventory')
    .insert(payload)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: `HU ${hu_number} již v aktivním skladu existuje!` }
    }
    return { success: false, error: error.message }
  }

  if (data) {
    await logAction(uih, (data as any).id, hu_number, 'create', null, { quantity, bin_location }, notes || "Manuální přidání")
  }
  
  revalidatePath('/')
  return { success: true, message: "Záznam úspěšně přidán." }
}

// Úprava množství nebo pozice
export async function updateInventoryRecord(
  uih: string,
  id: string,
  newQuantity: number,
  newBinLocation: string,
  notes: string
): Promise<BaseActionResponse> {
  if (!uih || !notes) return { success: false, error: "UIH a poznámka (důvod úpravy) jsou povinné." }
  if (newQuantity < 0) return { success: false, error: "Množství nesmí být záporné." }

  const { data: oldData, error: fetchError } = await (supabase as any)
    .from('inventory')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !oldData) return { success: false, error: "Původní záznam nenalezen." }

  const payload = {
    quantity: newQuantity,
    bin_location: newBinLocation,
    notes: oldData.notes ? `${oldData.notes} | Úprava: ${notes}` : notes
  }

  const { error: updateError } = await (supabase as any)
    .from('inventory')
    .update(payload)
    .eq('id', id)

  if (updateError) return { success: false, error: updateError.message }

  if (oldData.quantity !== newQuantity) {
    await logAction(uih, id, oldData.hu_number, 'update_quantity', { quantity: oldData.quantity }, { quantity: newQuantity }, notes)
  }
  
  if (oldData.bin_location !== newBinLocation) {
    await logAction(uih, id, oldData.hu_number, 'update_bin', { bin_location: oldData.bin_location }, { bin_location: newBinLocation }, notes)
  }

  revalidatePath('/')
  return { success: true, message: "Záznam úspěšně upraven." }
}

// Přesun do Pick skladu (částečný nebo úplný)
export async function transferToSAP(
  uih: string,
  id: string,
  transferQuantity: number,
  notes: string
): Promise<BaseActionResponse> {
  if (!uih) return { success: false, error: "UIH je povinné." }
  if (transferQuantity <= 0) return { success: false, error: "Přesouvané množství musí být větší než 0." }

  const { data: oldData, error: fetchError } = await (supabase as any)
    .from('inventory')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !oldData) return { success: false, error: "Záznam nenalezen." }
  if (transferQuantity > oldData.quantity) return { success: false, error: "Nelze přesunout více, než je fyzicky na skladě." }

  const remainingQuantity = oldData.quantity - transferQuantity
  const isFullTransfer = remainingQuantity === 0

  if (isFullTransfer) {
    const payload = { quantity: 0, status: 'archived', notes: notes || "Přesun do Pick skladu" }
    
    const { error: updateError } = await (supabase as any)
      .from('inventory')
      .update(payload)
      .eq('id', id)

    if (updateError) return { success: false, error: updateError.message }
    
    await logAction(uih, id, oldData.hu_number, 'full_transfer', { quantity: oldData.quantity }, { quantity: 0 }, notes)
    await logAction(uih, id, oldData.hu_number, 'archive', { status: 'active' }, { status: 'archived' }, "Automatická archivace po přesunu")
  } else {
    const payload = { quantity: remainingQuantity }

    const { error: updateError } = await (supabase as any)
      .from('inventory')
      .update(payload)
      .eq('id', id)

    if (updateError) return { success: false, error: updateError.message }
    
    await logAction(uih, id, oldData.hu_number, 'partial_transfer', { quantity: oldData.quantity }, { quantity: remainingQuantity }, notes)
  }

  revalidatePath('/')
  return { success: true, message: isFullTransfer ? "HU kompletně přesunuta do Pick skladu a archivována." : "Část HU přesunuta do Pick skladu." }
}

// Hromadná archivace (Odstranění)
export async function bulkArchiveRecords(
  uih: string, 
  ids: string[], 
  notes: string
): Promise<BaseActionResponse> {
  if (!uih || !notes) return { success: false, error: "UIH a poznámka jsou povinné." }
  if (!ids || ids.length === 0) return { success: false, error: "Nejsou vybrány žádné záznamy." }

  const { data: oldData, error: fetchErr } = await (supabase as any)
    .from('inventory')
    .select('*')
    .in('id', ids)
    
  if (fetchErr || !oldData) return { success: false, error: "Záznamy nenalezeny." }

  const { error: updErr } = await (supabase as any)
    .from('inventory')
    .update({ quantity: 0, status: 'archived', notes: notes })
    .in('id', ids)

  if (updErr) return { success: false, error: updErr.message }

  const logs = oldData.map((old: any) => ({
    uih, 
    inventory_id: old.id, 
    hu_number: old.hu_number, 
    action: 'archive',
    old_value: { quantity: old.quantity, status: 'active' },
    new_value: { quantity: 0, status: 'archived' },
    notes: notes || "Hromadná archivace"
  }))
  
  await (supabase as any).from('history_logs').insert(logs)

  revalidatePath('/')
  return { success: true, message: `Úspěšně archivováno ${ids.length} záznamů.` }
}
