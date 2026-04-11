import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth'
import { availabilityRepo } from '@/server/repositories/availability.repo'
import { ok } from '@/server/response'

/**
 * GET /api/v1/availability/:cleanerId/dates?days=30
 *
 * Returns an array of YYYY-MM-DD date strings (next N days) where the cleaner
 * has at least one active schedule matching that day of the week.
 * This is a lightweight check — it doesn't account for blocked times or
 * existing bookings (those are checked when fetching actual slots).
 */
export const GET = requireAuth(async (req: NextRequest, ctx) => {
  const { cleanerId } = await ctx.params
  const days = Math.min(Number(req.nextUrl.searchParams.get('days') ?? 30), 90)

  const schedules = await availabilityRepo.getSchedule(cleanerId)
  const activeDays = new Set(
    schedules.filter(s => s.isActive).map(s => s.dayOfWeek as number),
  )

  const dates: string[] = []
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() + i)
    const dow = d.getUTCDay() === 0 ? 7 : d.getUTCDay() // ISO weekday
    if (activeDays.has(dow)) {
      const yyyy = d.getUTCFullYear()
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
      const dd = String(d.getUTCDate()).padStart(2, '0')
      dates.push(`${yyyy}-${mm}-${dd}`)
    }
  }

  return ok(dates)
})
