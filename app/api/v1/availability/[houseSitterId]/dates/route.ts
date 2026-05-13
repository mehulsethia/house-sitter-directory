import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth'
import { availabilityService } from '@/server/services/availability.service'
import { ok, err } from '@/server/response'
import { availableDatesQuerySchema } from '@/server/schemas/availability.schema'

/**
 * GET /api/v1/availability/:houseSitterId/dates?duration_hours=2&days_ahead=28
 * 
 * Returns an array of YYYY-MM-DD date strings where the house sitter has
 * bookable slots for the given duration.
 */
export const GET = requireAuth(async (req: NextRequest, ctx) => {
  const { houseSitterId } = await ctx.params
  const params = Object.fromEntries(req.nextUrl.searchParams)
  const parsed = availableDatesQuerySchema.safeParse(params)
  if (!parsed.success) return err(parsed.error.message, 422)

  const dates = await availabilityService.getBookableDates(
    houseSitterId,
    parsed.data.duration_hours,
    parsed.data.days_ahead,
  )

  return ok(dates)
})
