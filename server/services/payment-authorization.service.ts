import type Stripe from 'stripe'
import { paymentRepo } from '../repositories/payment.repo'
import { bookingRepo } from '../repositories/booking.repo'
import { notificationRepo } from '../repositories/notification.repo'

export const paymentAuthorizationService = {
  async syncFromPaymentIntent(pi: Stripe.PaymentIntent) {
    const payment = await paymentRepo.findByStripeIntentId(pi.id)
    if (!payment) {
      return { updated: false, reason: 'payment_not_found' as const }
    }

    if (pi.currency !== 'eur') {
      await paymentRepo.update(payment.id, { status: 'failed', failedAt: new Date() })
      return { updated: true, reason: 'invalid_currency' as const }
    }

    if (pi.status !== 'requires_capture') {
      return { updated: false, reason: 'not_capturable' as const }
    }

    const wasAuthorized = payment.status === 'authorized'
    await paymentRepo.update(payment.id, { status: 'authorized', authorizedAt: new Date() })

    const bookingId = pi.metadata?.booking_id
    if (!bookingId) {
      return { updated: true, reason: 'authorized_no_booking' as const }
    }

    const booking = await bookingRepo.findById(bookingId)
    if (!booking) {
      return { updated: true, reason: 'authorized_booking_not_found' as const }
    }

    if (booking.status === 'pending') {
      await bookingRepo.update(booking.id, { status: 'pending', confirmedAt: new Date() })

      if (!wasAuthorized) {
        await notificationRepo.create({
          userId: booking.cleaner.userId,
          type: 'booking_request',
          title: 'New Booking Request',
          body: `You have a new booking request from ${booking.client.user?.name ?? 'a client'}`,
          data: { booking_id: booking.id },
        })
      }

      return { updated: true, reason: 'authorized_pending_notified' as const }
    }

    if (booking.status === 'accepted') {
      await bookingRepo.update(booking.id, { status: 'confirmed', confirmedAt: new Date() })
      return { updated: true, reason: 'authorized_accepted_confirmed' as const }
    }

    return { updated: true, reason: 'authorized_no_transition' as const }
  },
}
