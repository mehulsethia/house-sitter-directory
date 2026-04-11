import { NextRequest } from 'next/server'
import { requireClient } from '@/server/auth'
import { disputeRepo } from '@/server/repositories/dispute.repo'
import { bookingRepo } from '@/server/repositories/booking.repo'
import { clientRepo } from '@/server/repositories/client.repo'
import { ok, err } from '@/server/response'
import { createDisputeSchema } from '@/server/schemas/dispute.schema'

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

  const disputeDeadline = new Date(booking.completedAt.getTime() + 24 * 60 * 60 * 1000)
  if (Date.now() > disputeDeadline.getTime()) {
    return err('Dispute window has expired (24 hours after completion)', 400)
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

  return ok(dispute, 201)
})
