import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth'
import { userRepo } from '@/server/repositories/user.repo'
import { houseSitRepo } from '@/server/repositories/house-sit.repo'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { loopsEmailService } from '@/server/services/loops-email.service'
import { pushInAppNotification } from '@/server/services/in-app-notification.service'
import { ok } from '@/server/response'
import { syncUserSchema } from '@/server/schemas/user.schema'
import { isLikelyE164, normalizePhoneE164 } from '@/server/lib/phone'

export const POST = requireAuth(async (req: NextRequest, _ctx, user) => {
  const body = await req.json().catch(() => ({}))
  const parsed = syncUserSchema.safeParse(body)
  const data = parsed.success ? parsed.data : {}

  // Keep user profile fields in sync for newly-created sessions.
  const normalizedPhone = data.phone ? normalizePhoneE164(data.phone) : undefined
  if (data.name || normalizedPhone) {
    await userRepo.update(user.id, {
      ...(data.name ? { name: data.name } : {}),
      ...(normalizedPhone && isLikelyE164(normalizedPhone) ? { phone: normalizedPhone } : {}),
      ...(normalizedPhone && isLikelyE164(normalizedPhone) && normalizedPhone !== (user.phone ?? null) ? { phoneVerifiedAt: null } : {}),
    })
  }

  // Ensure role-specific profile exists
  if (user.role === 'house_sit') {
    const existing = await houseSitRepo.findByUserId(user.id)
    if (!existing) {
      await houseSitRepo.create(user.id)
      await pushInAppNotification({
        userId: user.id,
        type: 'account_created',
        title: 'Welcome to MaidHive',
        body: 'Your houseSit profile is ready. Start by browsing available house_sitters.',
      })
      try {
        await loopsEmailService.sendClientAccountCreated({
          email: user.email,
          fullName: user.name ?? data.name ?? 'HouseSit',
        })
      } catch (emailError) {
        console.error('Failed to send houseSit account created email via Loops:', emailError)
      }
    }
  } else if (user.role === 'house_sitter') {
    let existing = await houseSitterRepo.findByUserId(user.id)
    if (!existing) {
      await houseSitterRepo.create(user.id)
      existing = await houseSitterRepo.findByUserId(user.id)
      await pushInAppNotification({
        userId: user.id,
        type: 'account_created',
        title: 'Welcome to MaidHive',
        body: 'Your houseSitter profile is created. Complete onboarding to start receiving jobs.',
      })
      try {
        await loopsEmailService.sendCleanerSignup({
          email: user.email,
          fullName: user.name ?? data.name ?? 'HouseSitter',
        })
      } catch (emailError) {
        console.error('Failed to send houseSitter signup email via Loops:', emailError)
      }
    }

    if (existing && data.experience !== undefined) {
      await houseSitterRepo.update(existing.id, { yearsExperience: data.experience })
    }
  }

  const updated = await userRepo.findById(user.id)
  return ok(updated)
})
