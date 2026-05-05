-- Create client_favorites table for per-client saved cleaners
CREATE TABLE IF NOT EXISTS public.client_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  cleaner_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT client_favorites_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE,
  CONSTRAINT client_favorites_cleaner_id_fkey
    FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id) ON DELETE CASCADE,
  CONSTRAINT client_favorites_client_id_cleaner_id_key UNIQUE (client_id, cleaner_id)
);

-- Helpful lookup indexes
CREATE INDEX IF NOT EXISTS idx_client_favorites_client_id
  ON public.client_favorites(client_id);

CREATE INDEX IF NOT EXISTS idx_client_favorites_cleaner_id
  ON public.client_favorites(cleaner_id);
