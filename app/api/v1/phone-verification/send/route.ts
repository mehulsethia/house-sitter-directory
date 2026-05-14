import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireHouseSitOrHouseSitter } from '@/server/auth'
import { err, ok } from '@/server/response'
import { sendPhoneOtp } from '@/server/services/phone-verification.service'

const schema = z.object({
  phone: z.string().trim().min(8).max(20),
})

export const POST = requireHouseSitOrHouseSitter(async (req: NextRequest, _ctx, user) => {
  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return err(parsed.error.message, 422)

  try {
    await sendPhoneOtp(user.id, parsed.data.phone)
    return ok({ sent: true })
  } catch (error: any) {
    return err(error?.message ?? 'Failed to send verification code.', 400)
  }
})
