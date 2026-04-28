import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

// Zástupné hodnoty zabrání pádu Vercel buildu, pokud proměnné ještě nejsou načtené
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
