import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireClient } from '@/server/auth'
import { clientRepo } from '@/server/repositories/client.repo'
import { cleanerRepo } from '@/server/repositories/cleaner.repo'
import { clientFavoriteRepo } from '@/server/repositories/client-favorite.repo'
import { ok, err } from '@/server/response'

const addFavoriteSchema = z.object({
  cleaner_id: z.string().uuid(),
})

export const GET = requireClient(async (_req: NextRequest, _ctx, user) => {
  let client = await clientRepo.findByUserId(user.id)
  if (!client) client = await clientRepo.create(user.id)

  const favorites = await clientFavoriteRepo.listByClientId(client.id)
  const mapped = favorites
    .filter((favorite) => {
      const cleaner = favorite.cleaner
      return cleaner.status === 'approved' && cleaner.profileComplete && cleaner.stripeOnboardingComplete
    })
    .map((favorite) => {
      const cleaner = favorite.cleaner
      return {
        cleaner_id: cleaner.id,
        user_id: cleaner.userId,
        hourly_rate: Number(cleaner.hourlyRate),
        total_jobs: cleaner.totalJobs,
        average_rating: cleaner.averageRating ? Number(cleaner.averageRating) : null,
        years_experience: cleaner.yearsExperience,
        transport_mode: cleaner.transportMode,
        cleaning_supplies: cleaner.cleaningSupplies,
        bio: cleaner.bio,
        profile_image_url: cleaner.profileImageUrl,
        created_at: cleaner.createdAt,
        user: cleaner.user
          ? {
              id: cleaner.user.id,
              name: cleaner.user.name,
              avatar_url: cleaner.user.avatarUrl,
            }
          : undefined,
        service_areas: cleaner.serviceAreas.map((area) => ({
          city: area.city,
          postcode_prefix: area.postcodePrefix,
          radius_km: area.radiusKm ? Number(area.radiusKm) : undefined,
        })),
      }
    })

  return ok(mapped)
})

export const POST = requireClient(async (req: NextRequest, _ctx, user) => {
  const body = await req.json().catch(() => ({}))
  const parsed = addFavoriteSchema.safeParse(body)
  if (!parsed.success) return err('Invalid cleaner selection', 422)

  let client = await clientRepo.findByUserId(user.id)
  if (!client) client = await clientRepo.create(user.id)

  const cleaner = await cleanerRepo.findById(parsed.data.cleaner_id)
  if (!cleaner || cleaner.status !== 'approved' || !cleaner.profileComplete || !cleaner.stripeOnboardingComplete) {
    return err('Cleaner not found', 404)
  }

  await clientFavoriteRepo.add(client.id, cleaner.id)
  return ok({ favorite: true }, 201)
})

