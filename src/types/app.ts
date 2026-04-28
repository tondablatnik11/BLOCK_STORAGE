import { Database } from './database.types'

export type InventoryRecord = Database['public']['Tables']['inventory']['Row']
export type HistoryLog = Database['public']['Tables']['history_logs']['Row']
export type KPIDashboard = Database['public']['Views']['kpi_dashboard']['Row']

export type AuditAction = Database['public']['Tables']['history_logs']['Row']['action']
export type InventoryStatus = Database['public']['Tables']['inventory']['Row']['status']

export interface ImportError {
  rowNumber: number
  reason: string
  data?: Record<string, any>
}

export interface ImportResult {
  successCount: number
  skippedCount: number
  errors: ImportError[]
}

export interface BaseActionResponse {
  success: boolean
  message?: string
  error?: string
}
