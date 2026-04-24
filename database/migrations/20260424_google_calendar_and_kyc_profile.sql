-- Adds cleaner KYC document URL storage.
ALTER TABLE public.cleaners
  ADD COLUMN IF NOT EXISTS id_file_url TEXT;
