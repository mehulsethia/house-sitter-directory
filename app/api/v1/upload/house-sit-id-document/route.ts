import { NextRequest, NextResponse } from 'next/server'
import { requireHouseSit } from '@/server/auth'
import { houseSitRepo } from '@/server/repositories/house-sit.repo'
import { randomUUID } from 'crypto'
import { DOCUMENT_MIME_TYPES, matchesFileSignature } from '@/lib/file-signature'
import {
  createSignedUploadUrl,
  ensureStorageBucketExists,
  isBucketNotFoundError,
  supabaseAdmin,
} from '@/server/supabase-admin'

const HOUSE_SIT_ID_BUCKET = (
  process.env.SUPABASE_HOUSE_SIT_ID_BUCKET ??
  process.env.SUPABASE_CLIENT_ID_BUCKET ??
  'house-sit-ids'
).trim()
const ALLOWED_MIME = new Set(DOCUMENT_MIME_TYPES)
const EXT_BY_MIME: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export const POST = requireHouseSit(async (req: NextRequest, _ctx, user) => {
  const houseSit = await houseSitRepo.findByUserId(user.id)
  if (!houseSit) {
    return NextResponse.json({ success: false, message: 'HouseSit profile not found' }, { status: 404 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ success: false, message: 'Only PDF, JPEG, PNG, and WebP files are allowed' }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ success: false, message: 'File must be under 10MB' }, { status: 400 })
  }

  const ext = EXT_BY_MIME[file.type] ?? 'bin'
  const path = `${user.id}/${Date.now()}-${randomUUID()}.${ext}`
  const arrayBuffer = await file.arrayBuffer()
  if (!matchesFileSignature(new Uint8Array(arrayBuffer), file.type)) {
    return NextResponse.json({ success: false, message: 'Invalid file payload' }, { status: 400 })
  }

  try {
    await ensureStorageBucketExists(HOUSE_SIT_ID_BUCKET, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: Array.from(ALLOWED_MIME),
    })
  } catch (bucketError: any) {
    return NextResponse.json(
      { success: false, message: bucketError?.message ?? 'Failed to initialize houseSit ID storage bucket' },
      { status: 500 },
    )
  }

  let { error: uploadError } = await supabaseAdmin.storage.from(HOUSE_SIT_ID_BUCKET).upload(path, arrayBuffer, {
    contentType: file.type,
    upsert: true,
  })

  if (uploadError && isBucketNotFoundError(uploadError)) {
    try {
      await ensureStorageBucketExists(
        HOUSE_SIT_ID_BUCKET,
        {
          public: false,
          fileSizeLimit: 10 * 1024 * 1024,
          allowedMimeTypes: Array.from(ALLOWED_MIME),
        },
        { force: true },
      )
      const retried = await supabaseAdmin.storage.from(HOUSE_SIT_ID_BUCKET).upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      })
      uploadError = retried.error
    } catch (bucketError: any) {
      return NextResponse.json(
        { success: false, message: bucketError?.message ?? 'Failed to initialize houseSit ID storage bucket' },
        { status: 500 },
      )
    }
  }
  if (uploadError) {
    return NextResponse.json({ success: false, message: uploadError.message }, { status: 500 })
  }

  const signedUrl = await createSignedUploadUrl(HOUSE_SIT_ID_BUCKET, path)

  await houseSitRepo.update(houseSit.id, {
    idFileName: file.name,
    idFileUrl: signedUrl,
    idSubmittedAt: new Date(),
  })

  return NextResponse.json({
    success: true,
    data: { file_name: file.name, url: signedUrl },
  })
})
