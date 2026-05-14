#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')
const { PrismaClient } = require('@prisma/client')

// Load env in priority order for local execution.
for (const envFile of ['.env.local', '.env']) {
  const full = path.join(process.cwd(), envFile)
  if (fs.existsSync(full)) {
    dotenv.config({ path: full, override: false })
  }
}

const prisma = new PrismaClient()

const dryRun = process.argv.includes('--dry-run')

function isoOrNow(input) {
  return input instanceof Date && !Number.isNaN(input.getTime()) ? input : new Date()
}

function shortBooking(bookingId) {
  return typeof bookingId === 'string' ? bookingId.slice(0, 8) : ''
}

function makeBackfillKey(userId, type, ref) {
  return `${userId}|${type}|${ref ?? 'global'}`
}

async function main() {
  console.log(`Starting notification backfill${dryRun ? ' (dry-run)' : ''}...`)

  const [existingNotifications, bookings, disputes, users, house_sitters, admins] = await Promise.all([
    prisma.notification.findMany({
      select: { userId: true, type: true, data: true },
    }),
    prisma.booking.findMany({
      include: {
        houseSit: { include: { user: true } },
        houseSitter: { include: { user: true } },
        payment: true,
      },
    }),
    prisma.dispute.findMany({
      include: {
        booking: {
          include: {
            houseSit: { include: { user: true } },
            houseSitter: { include: { user: true } },
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ['house_sit', 'house_sitter'] } },
      select: { id: true, role: true, createdAt: true },
    }),
    prisma.houseSitter.findMany({
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.user.findMany({
      where: { role: 'admin', isActive: true },
      select: { id: true },
    }),
  ])

  const existingKeys = new Set()
  for (const row of existingNotifications) {
    const backfillKey = row?.data && typeof row.data === 'object' && !Array.isArray(row.data)
      ? row.data._backfill_key
      : null
    if (typeof backfillKey === 'string' && backfillKey.length > 0) {
      existingKeys.add(backfillKey)
    }
  }

  const pending = []
  const typeCounts = new Map()

  function queueNotification({ userId, type, title, body, data, createdAt, ref }) {
    const key = makeBackfillKey(userId, type, ref)
    if (existingKeys.has(key)) return
    existingKeys.add(key)

    pending.push({
      userId,
      type,
      title,
      body,
      data: {
        ...(data ?? {}),
        _backfill: true,
        _backfill_key: key,
      },
      createdAt: isoOrNow(createdAt),
    })
    typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1)
  }

  // Account created notifications
  for (const user of users) {
    if (user.role === 'house_sit') {
      queueNotification({
        userId: user.id,
        type: 'account_created',
        title: 'Welcome to MaidHive',
        body: 'Your houseSit profile is ready. Start by browsing available house_sitters.',
        createdAt: user.createdAt,
        ref: `account:${user.id}`,
      })
    } else if (user.role === 'house_sitter') {
      queueNotification({
        userId: user.id,
        type: 'account_created',
        title: 'Welcome to MaidHive',
        body: 'Your houseSitter profile is created. Complete onboarding to start receiving jobs.',
        createdAt: user.createdAt,
        ref: `account:${user.id}`,
      })
    }
  }

  // HouseSitter application notifications
  for (const houseSitter of house_sitters) {
    const houseSitterUserId = houseSitter.userId
    const name = houseSitter.user?.name ?? 'HouseSitter'
    if (houseSitter.status === 'pending' && houseSitter.profileComplete) {
      queueNotification({
        userId: houseSitterUserId,
        type: 'house_sitter_application_submitted',
        title: 'Application submitted',
        body: 'Your houseSitter profile has been submitted for admin review.',
        data: { house_sitter_id: houseSitter.id },
        createdAt: houseSitter.updatedAt ?? houseSitter.createdAt,
        ref: `house_sitter_submission:${houseSitter.id}:self`,
      })
      for (const admin of admins) {
        queueNotification({
          userId: admin.id,
          type: 'house_sitter_application_submitted',
          title: 'New houseSitter application',
          body: `${name} submitted onboarding for approval.`,
          data: { house_sitter_id: houseSitter.id },
          createdAt: houseSitter.updatedAt ?? houseSitter.createdAt,
          ref: `house_sitter_submission:${houseSitter.id}:admin`,
        })
      }
    }

    if (houseSitter.status === 'approved') {
      queueNotification({
        userId: houseSitterUserId,
        type: 'house_sitter_application_approved',
        title: 'HouseSitter profile approved',
        body: 'Your houseSitter profile has been approved and is now live.',
        data: { house_sitter_id: houseSitter.id },
        createdAt: houseSitter.approvedAt ?? houseSitter.updatedAt ?? houseSitter.createdAt,
        ref: `house_sitter_approved:${houseSitter.id}`,
      })
    }

    if (houseSitter.status === 'rejected') {
      queueNotification({
        userId: houseSitterUserId,
        type: 'house_sitter_application_rejected',
        title: 'HouseSitter profile rejected',
        body: houseSitter.rejectionReason
          ? `Your houseSitter profile was rejected: ${houseSitter.rejectionReason}`
          : 'Your houseSitter profile was rejected.',
        data: { house_sitter_id: houseSitter.id },
        createdAt: houseSitter.updatedAt ?? houseSitter.createdAt,
        ref: `house_sitter_rejected:${houseSitter.id}`,
      })
    }
  }

  // Booking + payment-derived notifications
  for (const booking of bookings) {
    const bookingRef = `booking:${booking.id}`
    const houseSitUserId = booking.houseSit?.userId
    const houseSitterUserId = booking.houseSitter?.userId
    if (!houseSitUserId || !houseSitterUserId) continue

    queueNotification({
      userId: houseSitUserId,
      type: 'booking_created_pending',
      title: 'Booking request created',
      body: 'Your booking request was created and is waiting for houseSitter response.',
      data: { booking_id: booking.id },
      createdAt: booking.createdAt,
      ref: `${bookingRef}:created_pending`,
    })

    if (booking.payment && ['authorized', 'captured', 'transferred', 'partially_refunded', 'refunded'].includes(booking.payment.status)) {
      queueNotification({
        userId: houseSitterUserId,
        type: 'booking_request',
        title: 'New Booking Request',
        body: `You have a new booking request from ${booking.houseSit?.user?.name ?? 'a houseSit'}`,
        data: { booking_id: booking.id },
        createdAt: booking.payment.authorizedAt ?? booking.confirmedAt ?? booking.createdAt,
        ref: `${bookingRef}:request`,
      })
    }

    if (booking.acceptedAt) {
      queueNotification({
        userId: houseSitUserId,
        type: 'booking_accepted',
        title: 'Booking accepted',
        body: 'HouseSitter accepted your booking request.',
        data: { booking_id: booking.id },
        createdAt: booking.acceptedAt,
        ref: `${bookingRef}:accepted`,
      })
    }

    if (booking.confirmedAt) {
      queueNotification({
        userId: houseSitUserId,
        type: 'booking_confirmed',
        title: 'Booking confirmed',
        body: 'Payment authorization is complete and your booking is now confirmed.',
        data: { booking_id: booking.id },
        createdAt: booking.confirmedAt,
        ref: `${bookingRef}:confirmed`,
      })
    }

    if (booking.status === 'expired') {
      queueNotification({
        userId: houseSitUserId,
        type: 'booking_request_expired',
        title: 'Booking request expired',
        body: 'This booking request closed before confirmation.',
        data: { booking_id: booking.id },
        createdAt: booking.updatedAt ?? booking.createdAt,
        ref: `${bookingRef}:expired:houseSit`,
      })
      queueNotification({
        userId: houseSitterUserId,
        type: 'booking_request_expired',
        title: 'Booking request expired',
        body: 'This booking request closed before confirmation.',
        data: { booking_id: booking.id },
        createdAt: booking.updatedAt ?? booking.createdAt,
        ref: `${bookingRef}:expired:houseSitter`,
      })
    }

    if (booking.status === 'cancelled') {
      const cancelledBy = booking.cancelledBy
      const notifyUserId = cancelledBy && cancelledBy === houseSitUserId ? houseSitterUserId : houseSitUserId
      queueNotification({
        userId: notifyUserId,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        body: 'A booking has been cancelled',
        data: { booking_id: booking.id },
        createdAt: booking.cancelledAt ?? booking.updatedAt ?? booking.createdAt,
        ref: `${bookingRef}:cancelled:${notifyUserId}`,
      })
    }

    if (booking.completedAt) {
      queueNotification({
        userId: houseSitUserId,
        type: 'booking_completed',
        title: 'Booking Completed',
        body: 'HouseSitter marked this booking as completed.',
        data: { booking_id: booking.id },
        createdAt: booking.completedAt,
        ref: `${bookingRef}:completed:houseSit`,
      })
      queueNotification({
        userId: houseSitterUserId,
        type: 'booking_completed',
        title: 'Booking completed',
        body: 'Booking marked complete. Payout will be released after the dispute window.',
        data: { booking_id: booking.id },
        createdAt: booking.completedAt,
        ref: `${bookingRef}:completed:houseSitter`,
      })
    }

    if (booking.payment?.capturedAt) {
      queueNotification({
        userId: houseSitUserId,
        type: 'payment_captured',
        title: 'Payment captured',
        body: 'Payment was captured successfully after booking completion.',
        data: { booking_id: booking.id },
        createdAt: booking.payment.capturedAt,
        ref: `${bookingRef}:payment_captured`,
      })
    }

    if (booking.payment?.transferredAt || booking.payment?.status === 'transferred') {
      queueNotification({
        userId: houseSitterUserId,
        type: 'payout_released',
        title: 'Payout released',
        body: 'Payout was released to your connected Stripe account.',
        data: { booking_id: booking.id },
        createdAt: booking.payment.transferredAt ?? booking.payment.updatedAt ?? booking.updatedAt,
        ref: `${bookingRef}:payout_released`,
      })
    }
  }

  // Dispute-derived notifications
  for (const dispute of disputes) {
    const booking = dispute.booking
    if (!booking?.houseSit?.userId || !booking?.houseSitter?.userId) continue
    const bookingId = booking.id
    const disputeRef = `dispute:${dispute.id}`

    if (dispute.status === 'under_review' || dispute.status === 'open') {
      queueNotification({
        userId: booking.houseSit.userId,
        type: 'dispute_under_review',
        title: 'Dispute under review',
        body: 'Your dispute is now under review by MaidHive.',
        data: { booking_id: bookingId, dispute_id: dispute.id },
        createdAt: dispute.updatedAt ?? dispute.createdAt,
        ref: `${disputeRef}:under_review:houseSit`,
      })
      queueNotification({
        userId: booking.houseSitter.userId,
        type: 'dispute_under_review',
        title: 'Dispute under review',
        body: 'A dispute was raised for this booking and is under review.',
        data: { booking_id: bookingId, dispute_id: dispute.id },
        createdAt: dispute.updatedAt ?? dispute.createdAt,
        ref: `${disputeRef}:under_review:houseSitter`,
      })
      for (const admin of admins) {
        queueNotification({
          userId: admin.id,
          type: 'dispute_raised',
          title: 'New dispute raised',
          body: `Booking ${shortBooking(bookingId)} has a new dispute requiring review.`,
          data: { booking_id: bookingId, dispute_id: dispute.id },
          createdAt: dispute.createdAt,
          ref: `${disputeRef}:raised:admin`,
        })
      }
    }

    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      const resolutionCopy = (() => {
        if (dispute.resolutionType === 'full_refund') return 'Resolution: full refund issued.'
        if (dispute.resolutionType === 'partial_refund') return 'Resolution: partial refund issued.'
        if (dispute.resolutionType === 'payment_released') return 'Resolution: payment released to houseSitter.'
        return 'Resolution: no refund, payment released to houseSitter.'
      })()

      queueNotification({
        userId: booking.houseSit.userId,
        type: 'dispute_resolved',
        title: 'Dispute resolved',
        body: resolutionCopy,
        data: { booking_id: bookingId, dispute_id: dispute.id },
        createdAt: dispute.resolvedAt ?? dispute.updatedAt ?? dispute.createdAt,
        ref: `${disputeRef}:resolved:houseSit`,
      })
      queueNotification({
        userId: booking.houseSitter.userId,
        type: 'dispute_resolved',
        title: 'Dispute resolved',
        body: resolutionCopy,
        data: { booking_id: bookingId, dispute_id: dispute.id },
        createdAt: dispute.resolvedAt ?? dispute.updatedAt ?? dispute.createdAt,
        ref: `${disputeRef}:resolved:houseSitter`,
      })
      for (const admin of admins) {
        queueNotification({
          userId: admin.id,
          type: 'dispute_resolved',
          title: 'Dispute resolved',
          body: `Dispute for booking ${shortBooking(bookingId)} was resolved.`,
          data: { booking_id: bookingId, dispute_id: dispute.id },
          createdAt: dispute.resolvedAt ?? dispute.updatedAt ?? dispute.createdAt,
          ref: `${disputeRef}:resolved:admin`,
        })
      }
    }
  }

  const sortedTypeCounts = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1])
  console.log(`Planned notifications: ${pending.length}`)
  for (const [type, count] of sortedTypeCounts) {
    console.log(`  ${type}: ${count}`)
  }

  if (dryRun) {
    console.log('Dry-run complete. No rows inserted.')
    return
  }

  if (pending.length === 0) {
    console.log('No missing notifications found. Nothing to insert.')
    return
  }

  const chunkSize = 500
  let inserted = 0
  for (let i = 0; i < pending.length; i += chunkSize) {
    const chunk = pending.slice(i, i + chunkSize)
    await prisma.notification.createMany({
      data: chunk,
    })
    inserted += chunk.length
    console.log(`Inserted ${inserted}/${pending.length}`)
  }

  console.log(`Backfill complete. Inserted ${inserted} notifications.`)
}

main()
  .catch((error) => {
    console.error('Backfill failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
