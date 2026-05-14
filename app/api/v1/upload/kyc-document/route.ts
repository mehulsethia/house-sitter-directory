import { NextRequest, NextResponse } from 'next/server'
import { requireHouseSitter } from '@/server/auth'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { randomUUID } from 'crypto'
import { DOCUMENT_MIME_TYPES, matchesFileSignature } from '@/lib/file-signature'
import {
  createSignedUploadUrl,
  ensureStorageBucketExists,
  isBucketNotFoundError,
  supabaseAdmin,
} from '@/server/supabase-admin'

const HOUSE_SITTER_KYC_BUCKET = (
  process.env.SUPABASE_HOUSE_SITTER_KYC_BUCKET ??
  process.env.SUPABASE_KYC_BUCKET ??
  'house-sitter-kyc'
).trim()
const ALLOWED_MIME = new Set(DOCUMENT_MIME_TYPES)
const EXT_BY_MIME: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export const POST = requireHouseSitter(async (req: NextRequest, _ctx, user) => {
  const houseSitter = await houseSitterRepo.findByUserId(user.id)
  if (!houseSitter) {
    return NextResponse.json({ success: false, message: 'HouseSitter profile not found' }, { status: 404 })
  }
  if (houseSitter.profileComplete && houseSitter.status !== 'rejected') {
    return NextResponse.json(
      {
        success: false,
        message: 'KYC document cannot be changed after submission unless your application is rejected.',
      },
      { status: 409 },
    )
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { success: false, message: 'Only PDF, JPEG, PNG, and WebP files are allowed' },
      { status: 400 },
    )
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
    await ensureStorageBucketExists(HOUSE_SITTER_KYC_BUCKET, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: Array.from(ALLOWED_MIME),
    })
  } catch (bucketError: any) {
    return NextResponse.json(
      { success: false, message: bucketError?.message ?? 'Failed to initialize KYC storage bucket' },
      { status: 500 },
    )
  }

  let { error: uploadError } = await supabaseAdmin.storage
    .from(HOUSE_SITTER_KYC_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError && isBucketNotFoundError(uploadError)) {
    try {
      await ensureStorageBucketExists(
        HOUSE_SITTER_KYC_BUCKET,
        {
          public: false,
          fileSizeLimit: 10 * 1024 * 1024,
          allowedMimeTypes: Array.from(ALLOWED_MIME),
        },
        { force: true },
      )
      const retried = await supabaseAdmin.storage
        .from(HOUSE_SITTER_KYC_BUCKET)
        .upload(path, arrayBuffer, {
          contentType: file.type,
          upsert: true,
        })
      uploadError = retried.error
    } catch (bucketError: any) {
      return NextResponse.json(
        { success: false, message: bucketError?.message ?? 'Failed to initialize KYC storage bucket' },
        { status: 500 },
      )
    }
  }

  if (uploadError) {
    return NextResponse.json({ success: false, message: uploadError.message }, { status: 500 })
  }

  const signedUrl = await createSignedUploadUrl(HOUSE_SITTER_KYC_BUCKET, path)

  await houseSitterRepo.update(houseSitter.id, {
    idFileName: file.name,
    idFileUrl: signedUrl,
  })

  return NextResponse.json({
    success: true,
    data: {
      file_name: file.name,
      url: signedUrl,
    },
  })
})
