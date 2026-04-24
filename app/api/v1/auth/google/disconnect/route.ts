import { requireCleaner } from '@/server/auth'
import { ok } from '@/server/response'
import { googleCalendarService } from '@/server/services/google-calendar.service'

export const POST = requireCleaner(async (_req, _ctx, user) => {
  await googleCalendarService.disconnect(user.id)
  return ok({ connected: false })
})
