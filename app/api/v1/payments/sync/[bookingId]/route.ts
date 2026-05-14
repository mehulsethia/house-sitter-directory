import { requireHouseSit } from '@/server/auth'
import { bookingRepo } from '@/server/repositories/booking.repo'
import { houseSitRepo } from '@/server/repositories/house-sit.repo'
import { paymentRepo } from '@/server/repositories/payment.repo'
import { stripe } from '@/server/stripe'
import { paymentAuthorizationService } from '@/server/services/payment-authorization.service'
import { ok, err } from '@/server/response'

// POST /api/v1/payments/sync/:bookingId
// Fallback for local/dev when webhook forwarding is unavailable.
export const POST = requireHouseSit(async (_req, ctx, user) => {
  const { bookingId } = await ctx.params

  const booking = await bookingRepo.findById(bookingId)
  if (!booking) return err('Booking not found', 404)

  const client = await houseSitRepo.findByUserId(user.id)
  if (!client || booking.clientId !== client.id) return err('Forbidden', 403)

  const payment = await paymentRepo.findByBookingId(bookingId)
  if (!payment) return err('Payment not found', 404)

  const pi = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId)
  const sync = await paymentAuthorizationService.syncFromPaymentIntent(pi)

  return ok({
    payment_intent_status: pi.status,
    payment_status: payment.status,
    sync,
  })
})
