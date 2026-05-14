BEGIN;

-- Temporarily relax role/proposal/supplies checks so value migration can run safely.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role = ANY (ARRAY['client', 'cleaner', 'house_sit', 'house_sitter', 'admin']));

-- Role values
UPDATE public.users SET role = 'house_sit' WHERE role = 'client';
UPDATE public.users SET role = 'house_sitter' WHERE role = 'cleaner';

-- Table renames
ALTER TABLE IF EXISTS public.cleaners RENAME TO house_sitters;
ALTER TABLE IF EXISTS public.clients RENAME TO house_sits;
ALTER TABLE IF EXISTS public.client_addresses RENAME TO house_sit_addresses;
ALTER TABLE IF EXISTS public.client_favorites RENAME TO house_sit_favorites;
ALTER TABLE IF EXISTS public.cleaner_strikes RENAME TO house_sitter_strikes;

-- Column renames
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'house_sit_addresses' AND column_name = 'client_id') THEN
    ALTER TABLE public.house_sit_addresses RENAME COLUMN client_id TO house_sit_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'house_sit_favorites' AND column_name = 'client_id') THEN
    ALTER TABLE public.house_sit_favorites RENAME COLUMN client_id TO house_sit_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'house_sit_favorites' AND column_name = 'cleaner_id') THEN
    ALTER TABLE public.house_sit_favorites RENAME COLUMN cleaner_id TO house_sitter_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'service_areas' AND column_name = 'cleaner_id') THEN
    ALTER TABLE public.service_areas RENAME COLUMN cleaner_id TO house_sitter_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'availability_schedules' AND column_name = 'cleaner_id') THEN
    ALTER TABLE public.availability_schedules RENAME COLUMN cleaner_id TO house_sitter_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'blocked_times' AND column_name = 'cleaner_id') THEN
    ALTER TABLE public.blocked_times RENAME COLUMN cleaner_id TO house_sitter_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'client_id') THEN
    ALTER TABLE public.bookings RENAME COLUMN client_id TO house_sit_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'cleaner_id') THEN
    ALTER TABLE public.bookings RENAME COLUMN cleaner_id TO house_sitter_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'cleaner_payout') THEN
    ALTER TABLE public.bookings RENAME COLUMN cleaner_payout TO house_sitter_payout;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'cleaner_proposals') THEN
    ALTER TABLE public.bookings RENAME COLUMN cleaner_proposals TO house_sitter_proposals;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'client_proposals') THEN
    ALTER TABLE public.bookings RENAME COLUMN client_proposals TO house_sit_proposals;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'post_cleaner_proposals') THEN
    ALTER TABLE public.bookings RENAME COLUMN post_cleaner_proposals TO post_house_sitter_proposals;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'post_client_proposals') THEN
    ALTER TABLE public.bookings RENAME COLUMN post_client_proposals TO post_house_sit_proposals;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'client_gcal_event_id') THEN
    ALTER TABLE public.bookings RENAME COLUMN client_gcal_event_id TO house_sit_gcal_event_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'cleaner_gcal_event_id') THEN
    ALTER TABLE public.bookings RENAME COLUMN cleaner_gcal_event_id TO house_sitter_gcal_event_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'booking_flow_drafts' AND column_name = 'client_id') THEN
    ALTER TABLE public.booking_flow_drafts RENAME COLUMN client_id TO house_sit_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'booking_flow_drafts' AND column_name = 'cleaner_id') THEN
    ALTER TABLE public.booking_flow_drafts RENAME COLUMN cleaner_id TO house_sitter_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'cleaner_payout') THEN
    ALTER TABLE public.payments RENAME COLUMN cleaner_payout TO house_sitter_payout;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'cleaner_id') THEN
    ALTER TABLE public.reviews RENAME COLUMN cleaner_id TO house_sitter_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'client_id') THEN
    ALTER TABLE public.reviews RENAME COLUMN client_id TO house_sit_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'cleaner_reply') THEN
    ALTER TABLE public.reviews RENAME COLUMN cleaner_reply TO house_sitter_reply;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'cleaner_reply_at') THEN
    ALTER TABLE public.reviews RENAME COLUMN cleaner_reply_at TO house_sitter_reply_at;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'house_sitter_strikes' AND column_name = 'cleaner_id') THEN
    ALTER TABLE public.house_sitter_strikes RENAME COLUMN cleaner_id TO house_sitter_id;
  END IF;
END $$;

-- Value migrations used in profile fields
DO $$
DECLARE
  supplies_constraint_name text;
BEGIN
  SELECT c.conname
  INTO supplies_constraint_name
  FROM pg_constraint c
  WHERE c.conrelid = 'public.house_sitters'::regclass
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) ILIKE '%cleaning_supplies%'
  LIMIT 1;

  IF supplies_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.house_sitters DROP CONSTRAINT %I', supplies_constraint_name);
  END IF;
END $$;

UPDATE public.house_sitters
SET cleaning_supplies = CASE
  WHEN cleaning_supplies = 'client_supplies' THEN 'house_sit_supplies'
  WHEN cleaning_supplies IN ('own_supplies', 'house_sit_supplies', 'house_sitter_brings', 'house_sit_provides') THEN cleaning_supplies
  WHEN cleaning_supplies IS NULL THEN NULL
  ELSE NULL
END;

ALTER TABLE public.house_sitters
  ADD CONSTRAINT house_sitters_cleaning_supplies_check
  CHECK (
    cleaning_supplies IS NULL
    OR cleaning_supplies = ANY (ARRAY['own_supplies', 'house_sit_supplies', 'house_sitter_brings', 'house_sit_provides'])
  );

DO $$
DECLARE
  proposal_constraint_name text;
BEGIN
  SELECT c.conname
  INTO proposal_constraint_name
  FROM pg_constraint c
  WHERE c.conrelid = 'public.bookings'::regclass
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) ILIKE '%proposal_by%'
  LIMIT 1;

  IF proposal_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.bookings DROP CONSTRAINT %I', proposal_constraint_name);
  END IF;
END $$;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_proposal_by_check
  CHECK (proposal_by IS NULL OR proposal_by = ANY (ARRAY['client', 'cleaner', 'house_sit', 'house_sitter']));

UPDATE public.bookings
SET proposal_by = 'house_sit'
WHERE proposal_by = 'client';

UPDATE public.bookings
SET proposal_by = 'house_sitter'
WHERE proposal_by = 'cleaner';

-- Tighten checks to final canonical values.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role = ANY (ARRAY['house_sit', 'house_sitter', 'admin']));

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_proposal_by_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_proposal_by_check
  CHECK (proposal_by IS NULL OR proposal_by = ANY (ARRAY['house_sit', 'house_sitter']));

COMMIT;
