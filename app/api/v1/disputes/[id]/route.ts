import { NextRequest } from 'next/server'
import { requireAuth } from '@/server/auth'
import { disputeRepo } from '@/server/repositories/dispute.repo'
import { bookingRepo } from '@/server/repositories/booking.repo'
import { houseSitRepo } from '@/server/repositories/house-sit.repo'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { ok, err } from '@/server/response'
import { createDisputeSchema } from '@/server/schemas/dispute.schema'
import { loopsEmailService } from '@/server/services/loops-email.service'
import { config } from '@/server/config'
import { pushInAppNotification } from '@/server/services/in-app-notification.service'
import { db } from '@/server/db'

const ISSUE_LABELS: Record<string, string> = {
  house_sitter_didnt_arrive: "HouseSitter didn't arrive",
  house_sit_no_show: 'HouseSit no-show',
  service_not_completed: 'Service not completed as expected',
  property_damage_safety: 'Property damage or safety issue',
  other_issue: 'Other issue',
}

const NO_SHOW_DELAY_MINUTES = 30

export const POST = requireAuth(async (req: NextRequest, ctx, user) => {
  const { id } = await ctx.params
  const booking = await bookingRepo.findById(id)
  if (!booking) return err('Booking not found', 404)

  const houseSit = await houseSitRepo.findByUserId(user.id)
  const houseSitter = await houseSitterRepo.findByUserId(user.id)
  const isHouseSit = Boolean(houseSit && booking.houseSitId === houseSit.id)
  const isHouseSitter = Boolean(houseSitter && booking.houseSitterId === houseSitter.id)
  if (!isHouseSit && !isHouseSitter && user.role !== 'admin') return err('Forbidden', 403)

  const existing = await disputeRepo.findByBookingId(id)
  if (existing?.status === 'under_review') {
    return err('This booking is currently under review by MaidHive.', 409)
  }
  if (existing) return err('Dispute already exists for this booking', 409)

  const body = await req.json()
  const parsed = createDisputeSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.message, 422)
  const issueType = parsed.data.issue_type
  const isNoShowIssue = issueType === 'house_sitter_didnt_arrive' || issueType === 'house_sit_no_show'

  if (isNoShowIssue) {
    const noShowAvailableAt = booking.scheduledStart.getTime() + NO_SHOW_DELAY_MINUTES * 60 * 1000
    if (Date.now() < noShowAvailableAt) {
      return err(`No-show reporting is available ${NO_SHOW_DELAY_MINUTES} minutes after scheduled start`, 400)
    }

    if (issueType === 'house_sitter_didnt_arrive' && !isHouseSit) {
      return err('Only the houseSit can report houseSitter no-show', 403)
    }
    if (issueType === 'house_sit_no_show' && !isHouseSitter) {
      return err('Only the houseSitter can report houseSit no-show', 403)
    }

    if (['cancelled', 'expired'].includes(booking.status)) {
      return err('No-show cannot be reported for cancelled or expired bookings', 400)
    }
  } else {
    if (!isHouseSit && !isHouseSitter) {
      return err('Only the houseSit or assigned houseSitter can submit this report type', 403)
    }

    if (!['in_progress', 'completed', 'disputed'].includes(booking.status)) {
      return err('This report can only be raised during or after the cleaning', 400)
    }

    if (isHouseSitter) {
      const houseSitterWindowMs = 24 * 60 * 60 * 1000
      const houseSitterDeadlineMs = booking.scheduledEnd.getTime() + houseSitterWindowMs
      if (Date.now() > houseSitterDeadlineMs) {
        return err('HouseSitter reporting window has expired (24 hours after scheduled completion)', 400)
      }
    } else if (booking.status !== 'in_progress') {
      if (!booking.completedAt) return err('Completed timestamp missing for this booking', 400)
      const disputeWindowMs = config.DISPUTE_WINDOW_HOURS * 60 * 60 * 1000
      if (Date.now() > booking.completedAt.getTime() + disputeWindowMs) {
        return err(`Dispute window has expired (${config.DISPUTE_WINDOW_HOURS} hours after completion)`, 400)
      }
    }
  }

  const created = await disputeRepo.create({
    bookingId: id,
    raisedBy: user.id,
    reason: ISSUE_LABELS[issueType] ?? 'Other issue',
    issueType,
    explanation: parsed.data.explanation,
    evidence: parsed.data.evidence,
  })
  const dispute = await disputeRepo.update(created.id, { status: 'under_review' })

  if (!['cancelled', 'expired'].includes(booking.status)) {
    await bookingRepo.update(id, { status: 'disputed' })
  }

  await pushInAppNotification({
    userId: booking.houseSit.userId,
    type: 'dispute_under_review',
    title: 'Dispute under review',
    body: 'Your dispute is now under review by MaidHive.',
    data: { booking_id: booking.id, dispute_id: dispute.id },
  })
  await pushInAppNotification({
    userId: booking.houseSitter.userId,
    type: 'dispute_under_review',
    title: 'Dispute under review',
    body: 'A dispute was raised for this booking and is under review.',
    data: { booking_id: booking.id, dispute_id: dispute.id },
  })

  const admins = await db.user.findMany({
    where: { role: 'admin', isActive: true },
    select: { id: true },
  })
  await Promise.all(
    admins.map((admin) =>
      pushInAppNotification({
        userId: admin.id,
        type: 'dispute_raised',
        title: 'New dispute raised',
        body: `Booking ${booking.id.slice(0, 8)} has a new dispute requiring review.`,
        data: { booking_id: booking.id, dispute_id: dispute.id },
      }),
    ),
  )

  try {
    await loopsEmailService.sendAdminDisputeRaised({
      bookingId: booking.id,
      houseSitName: booking.houseSit.user.name ?? 'HouseSit',
      houseSitterName: booking.houseSitter.user.name ?? 'HouseSitter',
      date: booking.scheduledStart.toISOString(),
    })
  } catch (emailError) {
    console.error('Failed to send admin dispute raised email via Loops:', emailError)
  }

  const recipient = issueType === 'house_sit_no_show' ? booking.houseSitter.user : booking.houseSit.user
  try {
    await loopsEmailService.sendClientIssueOrNoShowNotification({
      email: recipient.email,
      fullName: recipient.name ?? 'User',
      bookingId: booking.id,
    })
  } catch (emailError) {
    console.error('Failed to send issue/no-show email via Loops:', emailError)
  }

  return ok(dispute, 201)
})
