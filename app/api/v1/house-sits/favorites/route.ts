import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireHouseSit } from '@/server/auth'
import { db } from '@/server/db'
import { houseSitRepo } from '@/server/repositories/house-sit.repo'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { houseSitFavoriteRepo } from '@/server/repositories/house-sit-favorite.repo'
import { ok, err } from '@/server/response'

const addFavoriteSchema = z.object({
  house_sitter_id: z.string().uuid(),
})

export const GET = requireHouseSit(async (_req: NextRequest, _ctx, user) => {
  let houseSit = await houseSitRepo.findByUserId(user.id)
  if (!houseSit) houseSit = await houseSitRepo.create(user.id)

  const favorites = await houseSitFavoriteRepo.listByHouseSitId(houseSit.id)
  const visibleFavorites = favorites
    .filter((favorite) => {
      const houseSitter = favorite.houseSitter
      return houseSitter.status === 'approved' && houseSitter.profileComplete && houseSitter.stripeOnboardingComplete
    })
  const houseSitterIds = visibleFavorites.map((favorite) => favorite.houseSitter.id)

  const [completedJobsAgg, reviewsAgg] = houseSitterIds.length
    ? await Promise.all([
        db.booking.groupBy({
          by: ['houseSitterId'],
          where: {
            houseSitterId: { in: houseSitterIds },
            status: { in: ['completed', 'disputed'] },
          },
          _count: { _all: true },
        }),
        db.review.groupBy({
          by: ['houseSitterId'],
          where: {
            houseSitterId: { in: houseSitterIds },
          },
          _count: { _all: true },
          _avg: { rating: true },
        }),
      ])
    : [[], []]

  const completedJobsByCleanerId = new Map<string, number>(
    completedJobsAgg.map((entry) => [entry.houseSitterId, entry._count._all]),
  )
  const reviewsByCleanerId = new Map<string, { count: number; avg: number | null }>(
    reviewsAgg.map((entry) => [
      entry.houseSitterId,
      {
        count: entry._count._all,
        avg: entry._avg.rating ?? null,
      },
    ]),
  )

  const mapped = visibleFavorites.map((favorite) => {
      const houseSitter = favorite.houseSitter
      const jobsCount = completedJobsByCleanerId.get(houseSitter.id) ?? 0
      const reviewMetrics = reviewsByCleanerId.get(houseSitter.id)
      return {
        house_sitter_id: houseSitter.id,
        user_id: houseSitter.userId,
        hourly_rate: Number(houseSitter.hourlyRate),
        total_jobs: jobsCount,
        average_rating: reviewMetrics?.avg ?? null,
        review_count: reviewMetrics?.count ?? 0,
        years_experience: houseSitter.yearsExperience,
        transport_mode: houseSitter.transportMode,
        cleaning_supplies: houseSitter.cleaningSupplies,
        bio: houseSitter.bio,
        profile_image_url: houseSitter.profileImageUrl,
        created_at: houseSitter.createdAt,
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
      }
    })

  return ok(mapped)
})

export const POST = requireHouseSit(async (req: NextRequest, _ctx, user) => {
  const body = await req.json().catch(() => ({}))
  const parsed = addFavoriteSchema.safeParse(body)
  if (!parsed.success) return err('Invalid houseSitter selection', 422)

  let houseSit = await houseSitRepo.findByUserId(user.id)
  if (!houseSit) houseSit = await houseSitRepo.create(user.id)

  const houseSitter = await houseSitterRepo.findById(parsed.data.house_sitter_id)
  if (!houseSitter || houseSitter.status !== 'approved' || !houseSitter.profileComplete || !houseSitter.stripeOnboardingComplete) {
    return err('HouseSitter not found', 404)
  }

  await houseSitFavoriteRepo.add(houseSit.id, houseSitter.id)
  return ok({ favorite: true }, 201)
})
