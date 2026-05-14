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
    // Drift correction: if existing bucket visibility doesn't match requested, fix it.
    // Critical for KYC/ID/dispute buckets that may have been created public previously.
    if (typeof (existing as any).public === 'boolean' && (existing as any).public !== options.public) {
      await supabaseAdmin.storage.updateBucket(normalizedBucket, {
        public: options.public,
        fileSizeLimit: options.fileSizeLimit,
        allowedMimeTypes: options.allowedMimeTypes,
      })
    }
    ensuredBuckets.add(normalizedBucket)
    return
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(normalizedBucket, options)
  if (createError && !String(createError.message ?? '').toLowerCase().includes('already exists')) {
    throw createError
  }

  ensuredBuckets.add(normalizedBucket)
}

const DEFAULT_SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

export async function createSignedUploadUrl(
  bucket: string,
  path: string,
  expiresIn: number = DEFAULT_SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error || !data?.signedUrl) {
    throw error ?? new Error('Failed to create signed URL')
  }
  return data.signedUrl
}
