"use server"

import { supabase } from "../lib/supabase"
import { revalidatePath } from "next/cache"
import { ImportResult } from "../types/app"
import Papa from "papaparse"
import * as xlsx from "xlsx"

export async function processImport(formData: FormData): Promise<ImportResult> {
  const file = formData.get("file") as File
  const uih = formData.get("uih") as string
  const forceBlockInput = formData.get("forceBlock") as string
  const strategy = formData.get("duplicateStrategy") as string || "skip"

  const result: ImportResult = { successCount: 0, skippedCount: 0, errors: [] }

  if (!file || !uih) {
    result.errors.push({ rowNumber: 0, reason: "Chybí soubor nebo UIH." })
    return result
  }

  try {
    const fileName = file.name.toLowerCase()
    let parsedData: any[] = []

    // 1. ZPRACOVÁNÍ SOUBORU PODLE TYPU (CSV vs XLSX)
    if (fileName.endsWith('.csv')) {
      const text = await file.text()
      const parsed = Papa.parse(text, { skipEmptyLines: true })
      parsedData = parsed.data
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const workbook = xlsx.read(buffer, { type: 'buffer' })
      
      // Projdeme VŠECHNY listy (sheety) v sešitu a spojíme jejich data
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName]
        const sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1 })
        parsedData = parsedData.concat(sheetData)
      })
    } else {
      result.errors.push({ rowNumber: 0, reason: "Nepodporovaný formát. Nahrajte prosím .csv nebo .xlsx." })
      return result
    }

    // 2. DETEKCE GLOBÁLNÍHO BLOKU (Záloha)
    const isForced = !!forceBlockInput
    let fallbackBlock = forceBlockInput

    // Pokud uživatel nezadal block ručně, najdeme globální zálohu z textu pro řádky, kde block chybí
    if (!isForced) {
      const allText = parsedData.map(row => Array.isArray(row) ? row.join(" ") : "").join(" ")
      const blockMatch = allText.match(/BLOCK-(0[1-9]|[1-2][0-9]|30)/i)
      fallbackBlock = blockMatch ? blockMatch[0].toUpperCase() : ""
    }

    const validRecords: any[] = []
    const huRegex = /^\d{16,20}$/
    const binRegex = /^\d{2}-\d{2}-\d{2}-\d{2}/
    const blockRegex = /^BLOCK-(0[1-9]|[1-2][0-9]|30)$/i

    // 3. INTELIGENTNÍ HEURISTIKA ŘÁDKŮ
    parsedData.forEach((row: any, index: number) => {
      const rowNum = index + 1
      if (!Array.isArray(row)) return

      const strCols = row.map(c => String(c).trim()).filter(c => c !== "")
      if (strCols.length === 0) return

      const hu = strCols.find(c => huRegex.test(c))
      const bin = strCols.find(c => binRegex.test(c))
      // Najdeme platný block přímo na daném řádku
      const blockCol = strCols.find(c => blockRegex.test(c))
      
      // Detekce porušených řádků
      if (!hu && !bin) return 
      if (hu && !bin) { result.errors.push({ rowNumber: rowNum, reason: `Nalezena HU ${hu}, ale chybí formát pozice (xx-xx-xx-xx).` }); return; }
      if (!hu && bin) { result.errors.push({ rowNumber: rowNum, reason: `Nalezena pozice ${bin}, ale chybí formát HU (16-20 číslic).` }); return; }

      // ROZHODNUTÍ O BLOKU PRO KONKRÉTNÍ ŘÁDEK
      // 1. Zadal ho uživatel ručně? Použij vynucený.
      // 2. Je platný block na řádku? Použij ten z řádku.
      // 3. Jinak použij globální zálohu.
      const finalBlock = isForced ? forceBlockInput : (blockCol ? blockCol.toUpperCase() : fallbackBlock)

      if (!finalBlock) {
         result.errors.push({ rowNumber: rowNum, reason: `Na řádku chybí BLOCK a nebyl zadán ani globálně v okně.` })
         return
      }

      // Odstraníme klíčové prvky, abychom zbytek mohli analyzovat na množství a materiál
      const remaining = strCols.filter(c => c !== hu && c !== bin && c !== blockCol)
      
      // Množství
      const numberCandidates = remaining.filter(c => /^\d+$/.test(c) && c.length <= 7)
      let qtyStr = numberCandidates.length > 0 ? numberCandidates[0] : undefined

      // Materiál
      const potentialMaterials = remaining.filter(c => 
        c !== qtyStr && 
        !c.toLowerCase().includes('ok') && 
        !c.toLowerCase().includes('import') && 
        !/^\d{1,2}\.\d{1,2}\.?/.test(c)
      )
      
      let material = "NEZNÁMÝ"
      if (potentialMaterials.length > 0) { 
        potentialMaterials.sort((a, b) => b.length - a.length)
        material = potentialMaterials[0].toUpperCase()
      } else if (qtyStr && remaining.length === 1) { 
        material = qtyStr
        qtyStr = undefined
      }

      // Poznámka
      const notesCandidates = remaining.filter(c => c !== qtyStr && c !== material)
      const notes = notesCandidates.length > 0 ? notesCandidates.join(" | ") : "Hromadný import"

      validRecords.push({ 
        rowNumber: rowNum, 
        block: finalBlock, 
        material, 
        hu_number: hu, 
        quantity: qtyStr ? parseInt(qtyStr, 10) : 0, 
        bin_location: bin, 
        status: 'active', 
        notes 
      })
    })

    if (validRecords.length === 0) {
      result.errors.push({ rowNumber: 0, reason: "Ze souboru se nepodařilo přečíst žádná validní data. Zkontrolujte strukturu." })
      return result
    }

    // 4. KONTROLA DUPLICIT A PŘÍPRAVA NA INSERY / UPDATY
    const huList = validRecords.map(r => r.hu_number)
    const { data: existing, error: fetchErr } = await (supabase as any)
      .from('inventory')
      .select('id, hu_number, quantity, bin_location')
      .eq('status', 'active')
      .in('hu_number', huList)
      
    if (fetchErr) {
      result.errors.push({ rowNumber: 0, reason: `Chyba při komunikaci s databází: ${fetchErr.message}` })
      return result
    }

    const existingMap = new Map<string, any>(existing?.map((e: any) => [e.hu_number, e]) || [])
    
    const toInsert: any[] = []
    const toUpdate: any[] = []
    const updateLogs: any[] = []
    const localSet = new Set() 

    validRecords.forEach(rec => {
      if (existingMap.has(rec.hu_number)) {
        if (strategy === "skip") {
          result.skippedCount++
          result.errors.push({ rowNumber: rec.rowNumber, reason: `HU ${rec.hu_number} přeskočena (již existuje).` })
        } else {
          // STRATEGIE PŘEPSÁNÍ EXISTUJÍCÍCH DAT
          const exist = existingMap.get(rec.hu_number) as any
          const { rowNumber, ...dbData } = rec
          
          toUpdate.push({ id: exist.id, ...dbData })
          
          updateLogs.push({
            uih, 
            inventory_id: exist.id, 
            hu_number: rec.hu_number, 
            action: 'import',
            old_value: { quantity: exist.quantity, bin_location: exist.bin_location }, 
            new_value: { quantity: rec.quantity, bin_location: rec.bin_location }, 
            notes: "Hromadný import (Přepis z Excelu)"
          })
        }
      } else if (localSet.has(rec.hu_number)) {
        result.skippedCount++
        result.errors.push({ rowNumber: rec.rowNumber, reason: `HU ${rec.hu_number} se v souboru nachází duplicitně.` })
      } else {
        localSet.add(rec.hu_number)
        const { rowNumber, ...dbData } = rec
        toInsert.push(dbData)
      }
    })

    // 5A. PROVEDENÍ INSERTŮ (Nové HU)
    if (toInsert.length > 0) {
      const { data: inserted, error: insErr } = await (supabase as any)
        .from('inventory')
        .insert(toInsert)
        .select()
        
      if (insErr) {
        result.errors.push({ rowNumber: 0, reason: `Chyba při zápisu nových HU: ${insErr.message}` })
      } else if (inserted) {
        result.successCount += inserted.length
        
        const logs = inserted.map((item: any) => ({ 
          uih, 
          inventory_id: item.id, 
          hu_number: item.hu_number, 
          action: 'import', 
          new_value: { quantity: item.quantity, bin_location: item.bin_location }, 
          notes: "Nový hromadný import" 
        }))
        await (supabase as any).from('history_logs').insert(logs)
      }
    }

    // 5B. PROVEDENÍ UPDATŮ (Přepsané existující HU)
    if (toUpdate.length > 0) {
      const { error: updErr } = await (supabase as any)
        .from('inventory')
        .upsert(toUpdate)
        
      if (updErr) {
        result.errors.push({ rowNumber: 0, reason: `Chyba při přepisu existujících HU: ${updErr.message}` })
      } else {
        result.successCount += toUpdate.length
        await (supabase as any).from('history_logs').insert(updateLogs)
      }
    }

    revalidatePath('/')
    return result
    
  } catch (err: any) {
    result.errors.push({ rowNumber: 0, reason: err.message || 'Kritická systémová chyba.' })
    return result
  }
}
