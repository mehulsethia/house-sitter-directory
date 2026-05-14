import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/auth'
import { db } from '@/server/db'
import { randomUUID } from 'crypto'
import { IMAGE_MIME_TYPES, matchesFileSignature } from '@/lib/file-signature'
import {
  ensureStorageBucketExists,
  isBucketNotFoundError,
  supabaseAdmin,
} from '@/server/supabase-admin'

const PROFILE_IMAGES_BUCKET = (process.env.SUPABASE_PROFILE_IMAGES_BUCKET ?? 'profile-images').trim()
const ALLOWED_MIME = new Set(IMAGE_MIME_TYPES)
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
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
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ success: false, message: 'Image must be under 5MB' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  if (!matchesFileSignature(new Uint8Array(arrayBuffer), file.type)) {
    return NextResponse.json({ success: false, message: 'Invalid image payload' }, { status: 400 })
  }
  const ext = EXT_BY_MIME[file.type]
  const path = `${user.id}/${Date.now()}-${randomUUID()}.${ext}`

  try {
    await ensureStorageBucketExists(PROFILE_IMAGES_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: Array.from(ALLOWED_MIME),
    })
  } catch (bucketError: any) {
    return NextResponse.json(
      { success: false, message: bucketError?.message ?? 'Failed to initialize profile image bucket' },
      { status: 500 },
    )
  }

  let { error: uploadError } = await supabaseAdmin.storage
    .from(PROFILE_IMAGES_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError && isBucketNotFoundError(uploadError)) {
    try {
      await ensureStorageBucketExists(
        PROFILE_IMAGES_BUCKET,
        {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024,
          allowedMimeTypes: Array.from(ALLOWED_MIME),
        },
        { force: true },
      )
      const retried = await supabaseAdmin.storage
        .from(PROFILE_IMAGES_BUCKET)
        .upload(path, arrayBuffer, {
          contentType: file.type,
          upsert: true,
        })
      uploadError = retried.error
    } catch (bucketError: any) {
      return NextResponse.json(
        { success: false, message: bucketError?.message ?? 'Failed to initialize profile image bucket' },
        { status: 500 },
      )
    }
  }

  if (uploadError) {
    return NextResponse.json({ success: false, message: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(PROFILE_IMAGES_BUCKET)
    .getPublicUrl(path)

  const publicUrl = urlData.publicUrl

  // Update user avatar
  await db.user.update({
    where: { id: user.id },
    data: { avatarUrl: publicUrl },
  })

  // If houseSitter, also update profile_image_url on houseSitter record
  if (user.role === 'house_sitter') {
    await db.houseSitter.updateMany({
      where: { userId: user.id },
      data: { profileImageUrl: publicUrl },
    })
  }

  return NextResponse.json({ success: true, data: { url: publicUrl } })
})
