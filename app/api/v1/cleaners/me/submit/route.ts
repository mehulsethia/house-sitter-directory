import { requireCleaner } from '@/server/auth'
import { cleanerRepo } from '@/server/repositories/cleaner.repo'
import { availabilityRepo } from '@/server/repositories/availability.repo'
import { computeCleanerOnboardingProgress } from '@/server/services/cleaner-onboarding.service'
import { loopsEmailService } from '@/server/services/loops-email.service'
import { ok, err } from '@/server/response'

export const POST = requireCleaner(async (_req, _ctx, user) => {
  const cleaner = await cleanerRepo.findByUserId(user.id)
  if (!cleaner) return err('Cleaner profile not found.', 404)
  const shouldNotifyAdmin = cleaner.status !== 'pending' || !cleaner.profileComplete

  const schedules = await availabilityRepo.getSchedule(cleaner.id)
  const hasAvailabilitySlots = schedules.some((s) => s.isActive)
  const onboarding = computeCleanerOnboardingProgress({ cleaner, hasAvailabilitySlots })

  if (onboarding.completion_pct < 100) {
    return err('Profile is not yet complete. Please finish all onboarding steps first.', 400)
  }

  if (cleaner.status === 'approved') {
    return err('Profile is already approved.', 400)
  }

  const updated = await cleanerRepo.update(cleaner.id, {
    profileComplete: true,
    status: 'pending',
    rejectionReason: null,
  })

  if (shouldNotifyAdmin) {
    try {
      await loopsEmailService.sendAdminNewCleanerApplication({
        cleanerName: cleaner.user?.name ?? 'Cleaner',
        cleanerEmail: cleaner.user?.email ?? '',
      })
    } catch (emailError) {
      console.error('Failed to send admin cleaner application email via Loops:', emailError)
    }
  }

  return ok({ cleaner: updated, onboarding })
})
