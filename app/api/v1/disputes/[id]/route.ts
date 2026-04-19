import { NextRequest } from 'next/server'
import { requireClient } from '@/server/auth'
import { disputeRepo } from '@/server/repositories/dispute.repo'
import { bookingRepo } from '@/server/repositories/booking.repo'
import { clientRepo } from '@/server/repositories/client.repo'
import { ok, err } from '@/server/response'
import { createDisputeSchema } from '@/server/schemas/dispute.schema'
import { config } from '@/server/config'
import { loopsEmailService } from '@/server/services/loops-email.service'

export const POST = requireClient(async (req: NextRequest, ctx, user) => {
  const { id } = await ctx.params
  const booking = await bookingRepo.findById(id)
  if (!booking) return err('Booking not found', 404)

  const client = await clientRepo.findByUserId(user.id)
  if (!client || booking.clientId !== client.id) return err('Forbidden', 403)

  if (booking.status !== 'completed') {
    return err('Disputes can only be raised after booking completion', 400)
  }

  if (!booking.completedAt) {
    return err('Completed timestamp missing for this booking', 400)
  }

  const disputeWindowMs = config.CAPTURE_DELAY_HOURS * 60 * 60 * 1000
  const disputeWindowLabel = config.CAPTURE_DELAY_HOURS >= 1
    ? `${config.CAPTURE_DELAY_HOURS} hour${config.CAPTURE_DELAY_HOURS === 1 ? '' : 's'}`
    : `${Math.round(config.CAPTURE_DELAY_HOURS * 60)} minute${Math.round(config.CAPTURE_DELAY_HOURS * 60) === 1 ? '' : 's'}`
  const disputeDeadline = new Date(booking.completedAt.getTime() + disputeWindowMs)
  if (Date.now() > disputeDeadline.getTime()) {
    return err(`Dispute window has expired (${disputeWindowLabel} after completion)`, 400)
  }

  const existing = await disputeRepo.findByBookingId(id)
  if (existing) return err('Dispute already exists for this booking', 409)

  const body = await req.json()
  const parsed = createDisputeSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.message, 422)

  const dispute = await disputeRepo.create({
    bookingId: id,
    raisedBy: user.id,
    reason: parsed.data.reason,
    evidence: parsed.data.evidence,
  })

  await bookingRepo.update(id, { status: 'disputed' })

  try {
    await loopsEmailService.sendAdminDisputeRaised({
      bookingId: booking.id,
      clientName: booking.client.user.name ?? 'Client',
      cleanerName: booking.cleaner.user.name ?? 'Cleaner',
      date: booking.scheduledStart.toISOString(),
    })
  } catch (emailError) {
    console.error('Failed to send admin dispute raised email via Loops:', emailError)
  }

  try {
    await loopsEmailService.sendClientIssueOrNoShowNotification({
      email: booking.client.user.email,
      fullName: booking.client.user.name ?? 'Client',
      bookingId: booking.id,
    })
  } catch (emailError) {
    console.error('Failed to send client issue/no-show email via Loops:', emailError)
  }

  return ok(dispute, 201)
})
