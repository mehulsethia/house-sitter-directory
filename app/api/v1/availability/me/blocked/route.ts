import { NextRequest } from 'next/server'
import { requireCleaner } from '@/server/auth'
import { availabilityRepo } from '@/server/repositories/availability.repo'
import { cleanerRepo } from '@/server/repositories/cleaner.repo'
import { ok, err } from '@/server/response'
import { addBlockedTimeSchema } from '@/server/schemas/availability.schema'

export const POST = requireCleaner(async (req: NextRequest, _ctx, user) => {
  const body = await req.json()
  const parsed = addBlockedTimeSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.message, 422)

  const cleaner = await cleanerRepo.findByUserId(user.id)
  if (!cleaner) return err('Cleaner profile not found', 404)

  const start = new Date(parsed.data.start_datetime)
  const end = new Date(parsed.data.end_datetime)
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  if (start < todayStart) return err('Cannot block past dates', 422)

  const overlap = await availabilityRepo.getBlockedTimesInRange(cleaner.id, start, end)
  if (overlap.length > 0) return err('Blocked date overlaps with an existing blocked period', 409)

  const block = await availabilityRepo.addBlockedTime(cleaner.id, {
    startDatetime: start,
    endDatetime: end,
    reason: parsed.data.reason,
  })
  return ok(block, 201)
})
