import { NextRequest } from 'next/server'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { db } from '@/server/db'
import { ok, err } from '@/server/response'
import { houseSitterSearchSchema } from '@/server/schemas/house-sitter.schema'

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams)
  const parsed = houseSitterSearchSchema.safeParse(params)
  if (!parsed.success) return err(parsed.error.message, 422)

  const {
    city,
    availability,
    transport_mode,
    brings_own_supplies,
    services_offered,
    min_rating,
    min_price,
    max_price,
    page,
    page_size,
  } = parsed.data
  const servicesOffered = services_offered
    ? services_offered
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
    : undefined

  const [house_sitters, total] = await houseSitterRepo.search({
    city,
    availability,
    transportMode: transport_mode,
    cleaningSupplies: brings_own_supplies === 'yes' ? 'own_supplies' : brings_own_supplies === 'no' ? 'house_sit_supplies' : undefined,
    servicesOffered,
    minRating: min_rating,
    minPrice: min_price,
    maxPrice: max_price,
    page,
    pageSize: page_size,
  })
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

  const mapped = house_sitters.map((houseSitter) => ({
    id: houseSitter.id,
    user_id: houseSitter.userId,
    hourly_rate: Number(houseSitter.hourlyRate),
    total_jobs: completedJobsByCleanerId.get(houseSitter.id) ?? 0,
    average_rating: avgRatingByCleanerId.get(houseSitter.id) ?? null,
    years_experience: houseSitter.yearsExperience,
    transport_mode: houseSitter.transportMode,
    cleaning_supplies: houseSitter.cleaningSupplies,
    created_at: houseSitter.createdAt,
    bio: houseSitter.bio,
    skills: houseSitter.skills,
    profile_image_url: houseSitter.profileImageUrl,
    user: houseSitter.user
      ? {
          id: houseSitter.user.id,
          name: houseSitter.user.name,
          avatar_url: houseSitter.user.avatarUrl,
        }
      : undefined,
    service_areas: houseSitter.serviceAreas.map((area) => ({
      city: area.city,
      postcode_prefix: area.postcodePrefix,
      radius_km: area.radiusKm ? Number(area.radiusKm) : undefined,
    })),
  }))
  return ok({ house_sitters: mapped, total, page, page_size })
}
