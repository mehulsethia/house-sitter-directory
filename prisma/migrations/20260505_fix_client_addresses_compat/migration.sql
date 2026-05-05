-- Backfill client_addresses schema for environments that created the table earlier
-- without later optional columns used by profile + booking flows.

ALTER TABLE public.client_addresses
  ADD COLUMN IF NOT EXISTS label TEXT,
  ADD COLUMN IF NOT EXISTS apartment_details TEXT,
  ADD COLUMN IF NOT EXISTS access_notes TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(9, 6),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6),
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.client_addresses
SET access_notes = ''
WHERE access_notes IS NULL;

ALTER TABLE public.client_addresses
  ALTER COLUMN access_notes SET DEFAULT '',
  ALTER COLUMN access_notes SET NOT NULL;
