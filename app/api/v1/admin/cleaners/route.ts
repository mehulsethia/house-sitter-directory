import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { cleanerRepo } from '@/server/repositories/cleaner.repo'
import { ok } from '@/server/response'

export const GET = requireAdmin(async (req: NextRequest) => {
  const status = req.nextUrl.searchParams.get('status') ?? undefined
  const page = Number(req.nextUrl.searchParams.get('page') ?? 1)
  const pageSize = Number(req.nextUrl.searchParams.get('page_size') ?? 20)

  const [cleaners, total] = await cleanerRepo.listAll({ status, page, pageSize })
  const mapped = cleaners.map((cleaner) => ({
    id: cleaner.id,
    user_id: cleaner.userId,
    user_name: cleaner.user?.name ?? 'Cleaner',
    user_email: cleaner.user?.email ?? '',
    user_phone: cleaner.user?.phone ?? undefined,
    bio: cleaner.bio,
    skills: cleaner.skills,
    years_experience: cleaner.yearsExperience,
    hourly_rate: cleaner.hourlyRate,
    transport_mode: cleaner.transportMode,
    id_type: cleaner.idType,
    id_file_name: cleaner.idFileName,
    profile_image_url: cleaner.profileImageUrl,
    status: cleaner.status,
    rejection_reason: cleaner.rejectionReason,
    profile_complete: cleaner.profileComplete,
    identity_verified: cleaner.identityVerified,
    stripe_onboarding_complete: cleaner.stripeOnboardingComplete,
    total_jobs: cleaner.totalJobs,
    average_rating: cleaner.averageRating,
    created_at: cleaner.createdAt,
  }))
  return ok({ cleaners: mapped, total, page, page_size: pageSize })
})
