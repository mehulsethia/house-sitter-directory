import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { db } from '@/server/db'
import { ok } from '@/server/response'
import { deriveCleanerLifecycleStatus } from '@/lib/house-sitter-status'

export const GET = requireAdmin(async (req: NextRequest) => {
  const status = req.nextUrl.searchParams.get('status') ?? undefined
  const page = Number(req.nextUrl.searchParams.get('page') ?? 1)
  const pageSize = Number(req.nextUrl.searchParams.get('page_size') ?? 20)

  const [house_sitters, total] = await houseSitterRepo.listAll({ status, page, pageSize })
  const houseSitterIds = house_sitters.map((houseSitter) => houseSitter.id)
  const completedJobsAgg = houseSitterIds.length
    ? await db.booking.groupBy({
        by: ['houseSitterId'],
        where: {
          houseSitterId: { in: houseSitterIds },
          status: { in: ['completed', 'disputed'] },
        },
        _count: { _all: true },
      })
    : []
  const reviewsAgg = houseSitterIds.length
    ? await db.review.groupBy({
        by: ['houseSitterId'],
        where: { houseSitterId: { in: houseSitterIds } },
        _avg: { rating: true },
      })
    : []
  const completedJobsByCleanerId = new Map<string, number>(
    completedJobsAgg.map((entry) => [entry.houseSitterId, entry._count._all]),
  )
  const avgRatingByCleanerId = new Map<string, number | null>(
    reviewsAgg.map((entry) => [entry.houseSitterId, entry._avg.rating ?? null]),
  )

  const formatted = house_sitters.map((houseSitter) => {
    const fullName = houseSitter.user?.name?.trim()
    const fallbackName =
      fullName && fullName.length > 0
        ? fullName
        : houseSitter.user?.email?.split('@')[0] || 'HouseSitter'
    const lifecycleStatus = deriveCleanerLifecycleStatus({
      status: houseSitter.status,
      stripeOnboardingComplete: houseSitter.stripeOnboardingComplete,
    })
    const completedJobs = completedJobsByCleanerId.get(houseSitter.id) ?? 0
    return {
      id: houseSitter.id,
      user_id: houseSitter.userId,
      user_name: fallbackName,
      user_email: houseSitter.user?.email ?? '',
      user_phone: houseSitter.user?.phone ?? undefined,
      bio: houseSitter.bio,
      skills: houseSitter.skills,
      cleaning_supplies: houseSitter.cleaningSupplies,
      years_experience: houseSitter.yearsExperience,
      hourly_rate: houseSitter.hourlyRate,
      transport_mode: houseSitter.transportMode,
      id_type: houseSitter.idType,
      id_file_name: houseSitter.idFileName,
      id_file_url: houseSitter.idFileUrl,
      profile_image_url: houseSitter.profileImageUrl,
      status: houseSitter.status,
      lifecycle_status: lifecycleStatus,
      rejection_reason: houseSitter.rejectionReason,
      profile_complete: houseSitter.profileComplete,
      identity_verified: houseSitter.identityVerified,
      cleaning_standards_accepted: houseSitter.cleaningStandardsAccepted,
      standards_completed: houseSitter.standardsCompleted,
      quiz_passed: houseSitter.quizPassed,
      quiz_score: houseSitter.quizScore,
      stripe_onboarding_complete: houseSitter.stripeOnboardingComplete,
      trial_period_flag: completedJobs < 10,
      total_jobs: completedJobs,
      average_rating: avgRatingByCleanerId.get(houseSitter.id) ?? null,
      created_at: houseSitter.createdAt,
    }
  })
  return ok({ house_sitters: formatted, total, page, page_size: pageSize })
})
