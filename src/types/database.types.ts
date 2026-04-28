export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      inventory: {
        Row: {
          id: string
          block: string
          material: string
          hu_number: string
          quantity: number
          bin_location: string
          status: 'active' | 'archived'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          block: string
          material: string
          hu_number: string
          quantity?: number
          bin_location: string
          status?: 'active' | 'archived'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          block?: string
          material?: string
          hu_number?: string
          quantity?: number
          bin_location?: string
          status?: 'active' | 'archived'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      history_logs: {
        Row: {
          id: string
          uih: string
          inventory_id: string | null
          hu_number: string
          action: 'create' | 'import' | 'update_quantity' | 'update_bin' | 'update_note' | 'partial_transfer' | 'full_transfer' | 'archive'
          old_value: Json | null
          new_value: Json | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          uih: string
          inventory_id?: string | null
          hu_number: string
          action: 'create' | 'import' | 'update_quantity' | 'update_bin' | 'update_note' | 'partial_transfer' | 'full_transfer' | 'archive'
          old_value?: Json | null
          new_value?: Json | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          uih?: string
          inventory_id?: string | null
          hu_number?: string
          action?: 'create' | 'import' | 'update_quantity' | 'update_bin' | 'update_note' | 'partial_transfer' | 'full_transfer' | 'archive'
          old_value?: Json | null
          new_value?: Json | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      kpi_dashboard: {
        Row: {
          total_active_hu: number | null
          most_filled_block: string | null
          transfers_today: number | null
          transfers_this_month: number | null
          top_material: string | null
        }
      }
    }
  }
}
