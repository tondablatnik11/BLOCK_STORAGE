-- Supabase SQL Migration: Poznámky ke skladovým zásobám
-- Spusťte v Supabase SQL Editor

-- Tabulka pro historii poznámek
CREATE TABLE IF NOT EXISTS inventory_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  hu_number TEXT NOT NULL,
  note TEXT NOT NULL,
  created_by_uih TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_by_uih TEXT,
  updated_at TIMESTAMPTZ
);

-- Indexy pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS idx_inventory_notes_inventory_id ON inventory_notes(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_notes_hu_number ON inventory_notes(hu_number);
CREATE INDEX IF NOT EXISTS idx_inventory_notes_created_at ON inventory_notes(created_at DESC);
