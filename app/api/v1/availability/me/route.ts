import { NextRequest } from 'next/server'
import { requireHouseSitter } from '@/server/auth'
import { availabilityRepo } from '@/server/repositories/availability.repo'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { ok, err } from '@/server/response'
import { setScheduleSchema } from '@/server/schemas/availability.schema'

export const GET = requireHouseSitter(async (_req, _ctx, user) => {
  const houseSitter = await houseSitterRepo.findByUserId(user.id)
  if (!houseSitter) return err('HouseSitter profile not found', 404)
  const schedules = await availabilityRepo.getSchedule(houseSitter.id)
  return ok(schedules)
})

export const PUT = requireHouseSitter(async (req: NextRequest, _ctx, user) => {
  const body = await req.json()
  const parsed = setScheduleSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.message, 422)

  const houseSitter = await houseSitterRepo.findByUserId(user.id)
  if (!houseSitter) return err('HouseSitter profile not found', 404)

  const schedules = await availabilityRepo.replaceSchedule(
    houseSitter.id,
    parsed.data.schedules.map((s) => ({
      dayOfWeek: s.day_of_week,
      startTime: s.start_time,
      endTime: s.end_time,
      bufferMinutes: s.buffer_minutes,
      isActive: s.is_active,
    })),
  )
  return ok(schedules)
})
