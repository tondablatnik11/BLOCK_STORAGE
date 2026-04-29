-- Supabase SQL Migration: Inventurní modul
-- Spusťte v Supabase SQL Editor

-- Dávkové inventury (celý BLOCK)
CREATE TABLE IF NOT EXISTS inventory_check_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL DEFAULT 'block' CHECK (scope IN ('single_hu', 'block')),
  block TEXT,
  created_by_uih TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  total_items INTEGER DEFAULT 0,
  ok_count INTEGER DEFAULT 0,
  nok_count INTEGER DEFAULT 0
);

-- Jednotlivé inventurní záznamy
CREATE TABLE IF NOT EXISTS inventory_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
  hu_number TEXT NOT NULL,
  block TEXT NOT NULL,
  material TEXT NOT NULL,
  bin_location TEXT NOT NULL,
  system_quantity INTEGER NOT NULL,
  counted_quantity INTEGER NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('OK', 'NOK')),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_by_uih TEXT NOT NULL,
  notes TEXT,
  scope TEXT NOT NULL DEFAULT 'single_hu' CHECK (scope IN ('single_hu', 'block')),
  batch_id UUID REFERENCES inventory_check_batches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_inventory_checks_inventory_id ON inventory_checks(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_checks_hu_number ON inventory_checks(hu_number);
CREATE INDEX IF NOT EXISTS idx_inventory_checks_block ON inventory_checks(block);
CREATE INDEX IF NOT EXISTS idx_inventory_checks_result ON inventory_checks(result);
CREATE INDEX IF NOT EXISTS idx_inventory_checks_checked_at ON inventory_checks(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_checks_batch_id ON inventory_checks(batch_id);
