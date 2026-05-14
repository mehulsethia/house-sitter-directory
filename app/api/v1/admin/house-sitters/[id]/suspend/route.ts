import { requireAdmin } from '@/server/auth'
import { houseSitterService } from '@/server/services/house-sitter.service'
import { ServiceError } from '@/server/services/booking.service'
import { ok, err } from '@/server/response'

export const POST = requireAdmin(async (_req, ctx) => {
  const { id } = await ctx.params
  try {
    const cleaner = await houseSitterService.toggleSuspension(id)
    return ok(cleaner)
  } catch (e) {
    if (e instanceof ServiceError) return err(e.message, e.status)
    throw e
  }
})
