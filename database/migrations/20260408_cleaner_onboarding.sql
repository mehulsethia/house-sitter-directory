-- Cleaner onboarding + KYC fields
ALTER TABLE public.cleaners
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS transport_mode TEXT,
  ADD COLUMN IF NOT EXISTS transport_pickup_location TEXT,
  ADD COLUMN IF NOT EXISTS id_type TEXT,
  ADD COLUMN IF NOT EXISTS id_file_name TEXT,
  ADD COLUMN IF NOT EXISTS pet_acceptance BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS work_eligibility_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS onboarding_skipped_step3 BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_skipped_step4 BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Support multiple availability slots per day (instead of one slot/day)
ALTER TABLE public.availability_schedules
  DROP CONSTRAINT IF EXISTS availability_schedules_cleaner_id_day_of_week_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'availability_schedules_cleaner_id_day_of_week_start_time_end_time_key'
  ) THEN
    ALTER TABLE public.availability_schedules
      ADD CONSTRAINT availability_schedules_cleaner_id_day_of_week_start_time_end_time_key
      UNIQUE (cleaner_id, day_of_week, start_time, end_time);
  END IF;
END $$;
