import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/server/auth'
import { db } from '@/server/db'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { IMAGE_MIME_TYPES, matchesFileSignature } from '@/lib/file-signature'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
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

  const { error: uploadError } = await supabaseAdmin.storage
    .from('profile-images')
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ success: false, message: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabaseAdmin.storage
    .from('profile-images')
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
