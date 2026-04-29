"use server"

import { supabase } from "../lib/supabase"
import { revalidatePath } from "next/cache"
import { BaseActionResponse } from "../types/app"

// ═══════════════════════════════════════════════
// TYPY
// ═══════════════════════════════════════════════

export interface InventoryCheck {
  id: string
  inventory_id: string | null
  hu_number: string
  block: string
  material: string
  bin_location: string
  system_quantity: number
  counted_quantity: number
  result: 'OK' | 'NOK'
  checked_at: string
  checked_by_uih: string
  notes: string | null
  scope: 'single_hu' | 'block'
  batch_id: string | null
  created_at: string
}

export interface InventoryCheckBatch {
  id: string
  scope: string
  block: string | null
  created_by_uih: string
  created_at: string
  completed_at: string | null
  notes: string | null
  total_items: number
  ok_count: number
  nok_count: number
}

export interface CheckAnalytics {
  checksToday: number
  checksThisMonth: number
  okCount: number
  nokCount: number
  nokPercent: number
  topNokMaterials: { material: string; count: number }[]
  topNokBlocks: { block: string; count: number }[]
  recentChecks: InventoryCheck[]
}

// ═══════════════════════════════════════════════
// VYTVOŘENÍ INVENTURY PRO JEDNU HU
// ═══════════════════════════════════════════════

export async function createInventoryCheck(
  inventoryId: string,
  huNumber: string,
  block: string,
  material: string,
  binLocation: string,
  systemQuantity: number,
  countedQuantity: number,
  uih: string,
  notes: string | null
): Promise<BaseActionResponse> {
  if (!uih.trim()) return { success: false, error: "UIH je povinné." }
  if (countedQuantity < 0) return { success: false, error: "Spočítané množství nemůže být záporné." }

  const result = systemQuantity === countedQuantity ? 'OK' : 'NOK'

  if (result === 'NOK' && (!notes || !notes.trim())) {
    return { success: false, error: "U NOK inventury je povinná poznámka." }
  }

  const { error } = await (supabase as any)
    .from('inventory_checks')
    .insert({
      inventory_id: inventoryId,
      hu_number: huNumber,
      block,
      material,
      bin_location: binLocation,
      system_quantity: systemQuantity,
      counted_quantity: countedQuantity,
      result,
      checked_by_uih: uih.trim().toUpperCase(),
      notes: notes?.trim() || null,
      scope: 'single_hu'
    })

  if (error) {
    return { success: false, error: `Chyba při ukládání inventury: ${error.message}` }
  }

  // Audit log
  await (supabase as any)
    .from('history_logs')
    .insert({
      uih: uih.trim().toUpperCase(),
      inventory_id: inventoryId,
      hu_number: huNumber,
      action: 'update_quantity',
      old_value: { system_quantity: systemQuantity },
      new_value: { counted_quantity: countedQuantity, result },
      notes: `Inventura: ${result} (systém: ${systemQuantity}, spočítáno: ${countedQuantity})`
    })

  revalidatePath('/')
  return { success: true, message: `Inventura uložena: ${result}` }
}

// ═══════════════════════════════════════════════
// VYTVOŘENÍ DÁVKOVÉ INVENTURY (CELÝ BLOCK)
// ═══════════════════════════════════════════════

interface BlockCheckItem {
  inventoryId: string
  huNumber: string
  material: string
  binLocation: string
  systemQuantity: number
  countedQuantity: number
  notes: string | null
}

export async function createBlockInventoryCheckBatch(
  block: string,
  uih: string,
  items: BlockCheckItem[],
  batchNotes: string | null
): Promise<BaseActionResponse> {
  if (!uih.trim()) return { success: false, error: "UIH je povinné." }
  if (items.length === 0) return { success: false, error: "Žádné položky k inventuře." }

  // Validate NOK items have notes
  for (const item of items) {
    const result = item.systemQuantity === item.countedQuantity ? 'OK' : 'NOK'
    if (result === 'NOK' && (!item.notes || !item.notes.trim())) {
      return { success: false, error: `HU ${item.huNumber}: NOK inventura vyžaduje poznámku.` }
    }
  }

  // Create batch
  let okCount = 0
  let nokCount = 0
  items.forEach(item => {
    if (item.systemQuantity === item.countedQuantity) okCount++
    else nokCount++
  })

  const { data: batch, error: batchError } = await (supabase as any)
    .from('inventory_check_batches')
    .insert({
      scope: 'block',
      block,
      created_by_uih: uih.trim().toUpperCase(),
      completed_at: new Date().toISOString(),
      notes: batchNotes?.trim() || null,
      total_items: items.length,
      ok_count: okCount,
      nok_count: nokCount
    })
    .select('id')
    .single()

  if (batchError || !batch) {
    return { success: false, error: `Chyba při vytváření dávky: ${batchError?.message}` }
  }

  // Insert all checks
  const checks = items.map(item => ({
    inventory_id: item.inventoryId,
    hu_number: item.huNumber,
    block,
    material: item.material,
    bin_location: item.binLocation,
    system_quantity: item.systemQuantity,
    counted_quantity: item.countedQuantity,
    result: item.systemQuantity === item.countedQuantity ? 'OK' : 'NOK',
    checked_by_uih: uih.trim().toUpperCase(),
    notes: item.notes?.trim() || null,
    scope: 'block',
    batch_id: batch.id
  }))

  const { error: checksError } = await (supabase as any)
    .from('inventory_checks')
    .insert(checks)

  if (checksError) {
    return { success: false, error: `Chyba při ukládání inventur: ${checksError.message}` }
  }

  revalidatePath('/')
  return { 
    success: true, 
    message: `Dávková inventura ${block}: ${okCount} OK, ${nokCount} NOK z ${items.length} HU.`
  }
}

// ═══════════════════════════════════════════════
// POSLEDNÍ INVENTURA PRO KAŽDOU HU (pro sloupec v tabulce)
// ═══════════════════════════════════════════════

export interface LastCheckInfo {
  result: 'OK' | 'NOK'
  checked_at: string
  counted_quantity: number
  system_quantity: number
}

export async function getLastInventoryChecks(): Promise<Record<string, LastCheckInfo>> {
  const { data, error } = await (supabase as any)
    .from('inventory_checks')
    .select('inventory_id, result, checked_at, counted_quantity, system_quantity')
    .order('checked_at', { ascending: false })
    .limit(5000)

  if (error || !data) return {}

  const map: Record<string, LastCheckInfo> = {}
  data.forEach((row: any) => {
    if (row.inventory_id && !map[row.inventory_id]) {
      map[row.inventory_id] = {
        result: row.result,
        checked_at: row.checked_at,
        counted_quantity: row.counted_quantity,
        system_quantity: row.system_quantity
      }
    }
  })

  return map
}

// ═══════════════════════════════════════════════
// HISTORIE INVENTUR (s filtry)
// ═══════════════════════════════════════════════

export async function getInventoryCheckHistory(filters?: {
  block?: string
  material?: string
  huNumber?: string
  result?: string
  uih?: string
}): Promise<InventoryCheck[]> {
  let query = (supabase as any)
    .from('inventory_checks')
    .select('*')
    .order('checked_at', { ascending: false })
    .limit(500)

  if (filters?.block) query = query.eq('block', filters.block)
  if (filters?.material) query = query.ilike('material', `%${filters.material}%`)
  if (filters?.huNumber) query = query.ilike('hu_number', `%${filters.huNumber}%`)
  if (filters?.result) query = query.eq('result', filters.result)
  if (filters?.uih) query = query.ilike('checked_by_uih', `%${filters.uih}%`)

  const { data, error } = await query

  if (error) {
    console.error("Chyba při načítání historie inventur:", error)
    return []
  }

  return data || []
}

// ═══════════════════════════════════════════════
// ANALYTIKA INVENTUR
// ═══════════════════════════════════════════════

export async function getInventoryCheckAnalytics(): Promise<CheckAnalytics> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  // All checks this month
  const { data: monthData } = await (supabase as any)
    .from('inventory_checks')
    .select('result, material, block, checked_at, hu_number, counted_quantity, system_quantity, checked_by_uih, notes, scope, batch_id, id, inventory_id, bin_location, created_at')
    .gte('checked_at', monthStart.toISOString())
    .order('checked_at', { ascending: false })

  const allMonth = monthData || []

  const checksToday = allMonth.filter((c: any) => new Date(c.checked_at) >= today).length
  const okCount = allMonth.filter((c: any) => c.result === 'OK').length
  const nokCount = allMonth.filter((c: any) => c.result === 'NOK').length
  const nokPercent = allMonth.length > 0 ? Math.round((nokCount / allMonth.length) * 100) : 0

  // Top NOK materials
  const nokMaterials: Record<string, number> = {}
  const nokBlocks: Record<string, number> = {}
  allMonth.filter((c: any) => c.result === 'NOK').forEach((c: any) => {
    nokMaterials[c.material] = (nokMaterials[c.material] || 0) + 1
    nokBlocks[c.block] = (nokBlocks[c.block] || 0) + 1
  })

  const topNokMaterials = Object.entries(nokMaterials)
    .map(([material, count]) => ({ material, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const topNokBlocks = Object.entries(nokBlocks)
    .map(([block, count]) => ({ block, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    checksToday,
    checksThisMonth: allMonth.length,
    okCount,
    nokCount,
    nokPercent,
    topNokMaterials,
    topNokBlocks,
    recentChecks: allMonth.slice(0, 10) as InventoryCheck[]
  }
}
