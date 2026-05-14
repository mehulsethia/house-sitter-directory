import { requireAuth } from '@/server/auth'
import { bookingRepo } from '@/server/repositories/booking.repo'
import { houseSitRepo } from '@/server/repositories/house-sit.repo'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { bookingService } from '@/server/services/booking.service'
import { sanitizeBookingForRole } from '@/server/services/booking-visibility.service'
import { ok, err } from '@/server/response'

export const GET = requireAuth(async (_req, ctx, user) => {
  const { id } = await ctx.params
  await bookingService.reconcileSingleBookingDeadline(id)
  const booking = await bookingRepo.findById(id)
  if (!booking) return err('Booking not found', 404)

  const houseSit = await houseSitRepo.findByUserId(user.id)
  const houseSitter = await houseSitterRepo.findByUserId(user.id)
  const isParty =
    (houseSit && booking.houseSitId === houseSit.id) ||
    (houseSitter && booking.houseSitterId === houseSitter.id) ||
    user.role === 'admin'

  if (!isParty) return err('Forbidden', 403)

  return ok(sanitizeBookingForRole(booking as any, user.role as 'house_sit' | 'house_sitter' | 'admin'))
})
