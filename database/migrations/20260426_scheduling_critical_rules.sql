-- Scheduling system critical rules

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS proposal_context TEXT,
  ADD COLUMN IF NOT EXISTS proposal_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS post_cleaner_proposals INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS post_client_proposals INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS original_scheduled_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reauthorization_required BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reauthorization_grace_expires_at TIMESTAMPTZ;

UPDATE public.bookings
SET original_scheduled_start = scheduled_start
WHERE original_scheduled_start IS NULL;

ALTER TABLE public.bookings
  ALTER COLUMN original_scheduled_start SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_booking_proposal_context'
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT chk_booking_proposal_context
      CHECK (
        proposal_context IS NULL
        OR proposal_context IN ('pre_confirmation', 'post_confirmation', 'amend_start')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_booking_post_cleaner_proposals'
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT chk_booking_post_cleaner_proposals
      CHECK (post_cleaner_proposals >= 0 AND post_cleaner_proposals <= 1);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_booking_post_client_proposals'
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT chk_booking_post_client_proposals
      CHECK (post_client_proposals >= 0 AND post_client_proposals <= 1);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_booking_reauth_grace'
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT chk_booking_reauth_grace
      CHECK (reauthorization_required OR reauthorization_grace_expires_at IS NULL);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_booking_post_confirm_date_limit'
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT chk_booking_post_confirm_date_limit
      CHECK (
        proposal_context <> 'post_confirmation'
        OR proposed_start IS NULL
        OR proposed_start <= date_trunc('day', original_scheduled_start) + interval '14 days'
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_booking_amend_same_day_shift'
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT chk_booking_amend_same_day_shift
      CHECK (
        proposal_context <> 'amend_start'
        OR proposed_start IS NULL
        OR (
          date_trunc('day', proposed_start AT TIME ZONE 'Europe/Nicosia') = date_trunc('day', scheduled_start AT TIME ZONE 'Europe/Nicosia')
          AND ABS(EXTRACT(EPOCH FROM (proposed_start - scheduled_start))) <= 10800
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_status_accept_by ON public.bookings(status, accept_by);
CREATE INDEX IF NOT EXISTS idx_bookings_status_pay_by ON public.bookings(status, pay_by);
CREATE INDEX IF NOT EXISTS idx_bookings_proposal_expires_at ON public.bookings(proposal_expires_at);

CREATE OR REPLACE FUNCTION public.enforce_booking_max_advance_window()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.scheduled_start > (NOW() + interval '28 days') THEN
    RAISE EXCEPTION 'Bookings can only be made up to 28 days in advance';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bookings_enforce_max_advance_window ON public.bookings;

CREATE TRIGGER trg_bookings_enforce_max_advance_window
  BEFORE INSERT OR UPDATE OF scheduled_start ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_booking_max_advance_window();
