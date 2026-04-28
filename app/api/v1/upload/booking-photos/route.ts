import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/auth'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { IMAGE_MIME_TYPES, matchesFileSignature } from '@/lib/file-signature'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const BOOKING_PHOTOS_BUCKET = (process.env.SUPABASE_BOOKING_PHOTOS_BUCKET ?? 'booking-photos').trim()
const ALLOWED_MIME = new Set(IMAGE_MIME_TYPES)
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

let bucketEnsured = false

async function ensureBookingPhotosBucketExists() {
  if (bucketEnsured) return

  const { data: existing, error: fetchError } = await supabaseAdmin.storage.getBucket(BOOKING_PHOTOS_BUCKET)
  if (!fetchError && existing) {
    bucketEnsured = true
    return
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(BOOKING_PHOTOS_BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: Array.from(ALLOWED_MIME),
  })
  if (createError && !String(createError.message ?? '').toLowerCase().includes('already exists')) {
    throw createError
  }
  bucketEnsured = true
}

export const POST = requireAuth(async (req: NextRequest, _ctx, user) => {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ success: false, message: 'Only JPEG, PNG, and WebP images allowed' }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ success: false, message: 'Image must be under 10MB' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  if (!matchesFileSignature(new Uint8Array(arrayBuffer), file.type)) {
    return NextResponse.json({ success: false, message: 'Invalid image payload' }, { status: 400 })
  }

  const ext = EXT_BY_MIME[file.type]
  const path = `bookings/${user.id}/${Date.now()}-${randomUUID()}.${ext}`

  try {
    await ensureBookingPhotosBucketExists()
  } catch (bucketError: any) {
    return NextResponse.json(
      { success: false, message: bucketError?.message ?? 'Failed to initialize booking photos bucket' },
      { status: 500 },
    )
  }

  const { error: uploadError } = await supabaseAdmin.storage.from(BOOKING_PHOTOS_BUCKET).upload(path, arrayBuffer, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) {
    return NextResponse.json({ success: false, message: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabaseAdmin.storage.from(BOOKING_PHOTOS_BUCKET).getPublicUrl(path)
  return NextResponse.json({ success: true, data: { url: urlData.publicUrl } })
})
