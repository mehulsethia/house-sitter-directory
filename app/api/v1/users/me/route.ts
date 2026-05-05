import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth'
import { userRepo } from '@/server/repositories/user.repo'
import { ok, err } from '@/server/response'
import { updateUserSchema } from '@/server/schemas/user.schema'
import { isLikelyE164, normalizePhoneE164 } from '@/server/lib/phone'

export const PATCH = requireAuth(async (req: NextRequest, _ctx, user) => {
  const body = await req.json()
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.message, 422)
  const normalizedPhone =
    parsed.data.phone !== undefined && parsed.data.phone !== null
      ? normalizePhoneE164(parsed.data.phone)
      : parsed.data.phone
  if (typeof normalizedPhone === 'string' && !isLikelyE164(normalizedPhone)) {
    return err('Phone must be in international format, e.g. +447911123456.', 422)
  }

  const updated = await userRepo.update(user.id, {
    ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
    ...(parsed.data.phone !== undefined ? { phone: normalizedPhone } : {}),
    ...(parsed.data.phone !== undefined && normalizedPhone !== (user.phone ?? null) ? { phoneVerifiedAt: null } : {}),
    ...(parsed.data.avatar_url !== undefined ? { avatarUrl: parsed.data.avatar_url } : {}),
  })
  return ok(updated)
})

export const DELETE = requireAuth(async (_req, _ctx, user) => {
  await userRepo.softDelete(user.id)
  return ok({ message: 'Account deleted' })
})
