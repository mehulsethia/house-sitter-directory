import { requireHouseSitter } from '@/server/auth'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { availabilityRepo } from '@/server/repositories/availability.repo'
import {
  computeCleanerOnboardingProgress,
  validateCleanerSubmissionRequirements,
} from '@/server/services/house-sitter-onboarding.service'
import { loopsEmailService } from '@/server/services/loops-email.service'
import { pushInAppNotification } from '@/server/services/in-app-notification.service'
import { db } from '@/server/db'
import { ok, err } from '@/server/response'

export const POST = requireHouseSitter(async (_req, _ctx, user) => {
  if (!user.phone || !user.phoneVerifiedAt) {
    return err('Phone verification is required before submitting for approval.', 400)
  }

  const houseSitter = await houseSitterRepo.findByUserId(user.id)
  if (!houseSitter) return err('HouseSitter profile not found.', 404)
  const shouldNotifyAdmin = houseSitter.status !== 'pending' || !houseSitter.profileComplete

  const schedules = await availabilityRepo.getSchedule(houseSitter.id)
  const hasAvailabilitySlots = schedules.some((s) => s.isActive)
  const onboarding = computeCleanerOnboardingProgress({ houseSitter, hasAvailabilitySlots })
  const submissionValidation = validateCleanerSubmissionRequirements({ houseSitter, hasAvailabilitySlots })

  if (!submissionValidation.valid || onboarding.completion_pct < 100) {
    const missing = submissionValidation.missingFields
    const guidance =
      missing.length > 0
        ? ` Missing: ${missing.join(', ')}.`
        : ''
    return err(`Profile is not yet complete. Please finish all onboarding requirements first.${guidance}`, 400)
  }

  if (houseSitter.status === 'approved') {
    return err('Profile is already approved.', 400)
  }

  const updated = await houseSitterRepo.update(houseSitter.id, {
    profileComplete: true,
    status: 'pending',
    rejectionReason: null,
  })

  await pushInAppNotification({
    userId: user.id,
    type: 'house_sitter_application_submitted',
    title: 'Application submitted',
    body: 'Your houseSitter profile has been submitted for admin review.',
    data: { house_sitter_id: houseSitter.id },
  })

  if (shouldNotifyAdmin) {
    const admins = await db.user.findMany({
      where: { role: 'admin', isActive: true },
      select: { id: true },
    })
    await Promise.all(
      admins.map((admin) =>
        pushInAppNotification({
          userId: admin.id,
          type: 'house_sitter_application_submitted',
          title: 'New houseSitter application',
          body: `${houseSitter.user?.name ?? 'A houseSitter'} submitted onboarding for approval.`,
          data: { house_sitter_id: houseSitter.id },
        }),
      ),
    )

    try {
      await loopsEmailService.sendAdminNewCleanerApplication({
        houseSitterName: houseSitter.user?.name ?? 'HouseSitter',
        houseSitterEmail: houseSitter.user?.email ?? '',
      })
    } catch (emailError) {
      console.error('Failed to send admin houseSitter application email via Loops:', emailError)
    }
  }

  return ok({ houseSitter: updated, onboarding })
})
