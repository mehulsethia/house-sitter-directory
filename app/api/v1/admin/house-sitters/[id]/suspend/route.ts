import { requireAdmin } from '@/server/auth'
import { houseSitterService } from '@/server/services/house-sitter.service'
import { ServiceError } from '@/server/services/booking.service'
import { ok, err } from '@/server/response'

export const POST = requireAdmin(async (_req, ctx) => {
  const { id } = await ctx.params
  try {
    const houseSitter = await houseSitterService.toggleSuspension(id)
    return ok(houseSitter)
  } catch (e) {
    if (e instanceof ServiceError) return err(e.message, e.status)
    throw e
  }
})
