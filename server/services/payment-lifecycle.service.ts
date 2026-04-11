import { db } from '../db'
import { stripe } from '../stripe'
import { config } from '../config'

export const paymentLifecycleService = {
  async processDueCaptures(limit = 200) {
    const dueBefore = new Date(Date.now() - config.CAPTURE_DELAY_HOURS * 60 * 60 * 1000)

    const candidates = await db.payment.findMany({
      where: {
        status: 'authorized',
        booking: {
          status: { in: ['completed', 'disputed'] },
          completedAt: { lte: dueBefore },
        },
      },
      include: {
        booking: {
          include: { dispute: true },
        },
      },
      orderBy: { authorizedAt: 'asc' },
      take: limit,
    })

    const summary = {
      checked: candidates.length,
      captured: 0,
      paused_by_dispute: 0,
      skipped_non_due: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const payment of candidates) {
      try {
        const dispute = payment.booking.dispute

        if (dispute && dispute.status !== 'resolved') {
          summary.paused_by_dispute += 1
          continue
        }

        if (dispute?.status === 'resolved' && dispute.resolutionType === 'full_refund') {
          summary.skipped_non_due += 1
          continue
        }

        const captured = await stripe.paymentIntents.capture(payment.stripePaymentIntentId)
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: 'captured',
            stripeChargeId:
              typeof captured.latest_charge === 'string' ? captured.latest_charge : undefined,
            capturedAt: new Date(),
            payoutScheduledAt: new Date(Date.now() + config.PAYOUT_DELAY_HOURS * 60 * 60 * 1000),
          },
        })
        summary.captured += 1
      } catch (e: any) {
        summary.failed += 1
        summary.errors.push(`${payment.id}: ${e?.message ?? 'capture_failed'}`)
      }
    }

    return summary
  },

  async expireBookingDeadlines() {
    const now = new Date()

    const pending = await db.booking.updateMany({
      where: {
        status: 'pending',
        acceptBy: { lt: now },
      },
      data: {
        status: 'expired',
      },
    })

    const acceptedExpired = await db.booking.findMany({
      where: {
        status: 'accepted',
        payBy: { lt: now },
      },
      include: { payment: true },
    })

    let accepted = 0
    let cancelledIntents = 0

    for (const booking of acceptedExpired) {
      await db.booking.update({ where: { id: booking.id }, data: { status: 'expired' } })
      accepted += 1

      if (booking.payment && booking.payment.status === 'pending') {
        try {
          await stripe.paymentIntents.cancel(booking.payment.stripePaymentIntentId)
          await db.payment.update({
            where: { id: booking.payment.id },
            data: {
              status: 'failed',
              failedAt: new Date(),
            },
          })
          cancelledIntents += 1
        } catch {
          // Keep booking expiry deterministic even if Stripe cancellation fails.
        }
      }
    }

    return {
      expired_pending: pending.count,
      expired_accepted: accepted,
      cancelled_pending_intents: cancelledIntents,
    }
  },
}
