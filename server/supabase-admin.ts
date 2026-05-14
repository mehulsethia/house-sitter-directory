import { createClient } from '@supabase/supabase-js'

type EnsureBucketOptions = {
  public: boolean
  fileSizeLimit?: number
  allowedMimeTypes?: string[]
}

const ensuredBuckets = new Set<string>()

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export function isBucketNotFoundError(error: unknown): boolean {
  const message = String((error as any)?.message ?? '').toLowerCase()
  return message.includes('bucket not found')
}

export async function ensureStorageBucketExists(
  bucket: string,
  options: EnsureBucketOptions,
  opts?: { force?: boolean },
) {
  const normalizedBucket = String(bucket || '').trim()
  if (!normalizedBucket) throw new Error('Storage bucket name is required')

  if (!opts?.force && ensuredBuckets.has(normalizedBucket)) return

  const { data: existing, error: fetchError } = await supabaseAdmin.storage.getBucket(normalizedBucket)
  if (!fetchError && existing) {
    ensuredBuckets.add(normalizedBucket)
    return
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(normalizedBucket, options)
  if (createError && !String(createError.message ?? '').toLowerCase().includes('already exists')) {
    throw createError
  }

  ensuredBuckets.add(normalizedBucket)
}
