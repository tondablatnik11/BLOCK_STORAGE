// src/actions/history.ts
"use server"

import { supabase } from "../lib/supabase"
import { HistoryLog } from "../types/app"

export async function getHistoryLogs(): Promise<HistoryLog[]> {
  const { data, error } = await supabase
    .from('history_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (error) {
    console.error("Chyba při načítání historie:", error)
    return []
  }
  
  return data || []
}
