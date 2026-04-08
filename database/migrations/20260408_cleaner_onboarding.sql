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
DROP INDEX IF EXISTS public.availability_schedules_cleaner_id_day_of_week_key;

CREATE UNIQUE INDEX IF NOT EXISTS availability_schedules_cleaner_id_day_of_week_start_time_end_time_key
  ON public.availability_schedules (cleaner_id, day_of_week, start_time, end_time);
