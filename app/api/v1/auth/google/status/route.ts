import { requireCleaner } from '@/server/auth'
import { ok } from '@/server/response'
import { googleCalendarService } from '@/server/services/google-calendar.service'

export const GET = requireCleaner(async (_req, _ctx, user) => {
  const status = await googleCalendarService.getStatus(user.id)
  return ok(status)
})
