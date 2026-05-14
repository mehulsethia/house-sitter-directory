import { requireAdmin } from '@/server/auth'
import { db } from '@/server/db'
import { ok } from '@/server/response'
import { addUtcDays, endOfUtcDate, startOfUtcDate, todayUtcDateOnly } from '@/lib/datetime'

function bestEffortName(name?: string | null, email?: string | null): string {
  const trimmed = name?.trim()
  if (trimmed) return trimmed
  const emailLocal = email?.split('@')[0]?.trim()
  if (emailLocal) return emailLocal
  return 'HouseSitter'
}

export const GET = requireAdmin(async () => {
  const today = todayUtcDateOnly()
  const tomorrow = addUtcDays(today, 1)
  const dayAfterTomorrow = addUtcDays(today, 2)

  const todayStart = startOfUtcDate(today)
  const todayEnd = endOfUtcDate(today)
  const tomorrowStart = startOfUtcDate(tomorrow)
  const tomorrowEnd = endOfUtcDate(tomorrow)
  const afterTomorrowStart = startOfUtcDate(dayAfterTomorrow)

  const [
    pendingCleaners,
    activeDisputes,
    pendingBookingRequests,
    todayJobs,
    tomorrowJobs,
    paymentIssues,
    failedPayments,
    cancelledBookings,
    noShowDisputes,
  ] =
    await Promise.all([
      db.houseSitter.findMany({
        where: { status: 'pending' },
        include: { user: true },
        orderBy: { createdAt: 'asc' },
        take: 10,
      }),
      db.dispute.findMany({
        where: { status: { in: ['open', 'under_review'] } },
        orderBy: { createdAt: 'asc' },
        take: 10,
      }),
      db.booking.findMany({
        where: {
          status: 'pending',
          acceptBy: { gte: new Date() },
        },
        include: { houseSitter: { include: { user: true } }, houseSit: { include: { user: true } } },
        orderBy: { acceptBy: 'asc' },
        take: 20,
      }),
      db.booking.findMany({
        where: {
          status: { in: ['accepted', 'confirmed', 'in_progress'] },
          scheduledStart: { gte: todayStart, lte: todayEnd },
        },
        include: { houseSitter: { include: { user: true } }, houseSit: { include: { user: true } } },
        orderBy: { scheduledStart: 'asc' },
        take: 20,
      }),
      db.booking.findMany({
        where: {
          status: { in: ['accepted', 'confirmed', 'in_progress'] },
          scheduledStart: { gte: tomorrowStart, lte: tomorrowEnd },
        },
        include: { houseSitter: { include: { user: true } }, houseSit: { include: { user: true } } },
        orderBy: { scheduledStart: 'asc' },
        take: 20,
      }),
      db.booking.findMany({
        where: {
          status: 'accepted',
          reauthorizationRequired: true,
        },
        include: {
          houseSit: { include: { user: true } },
        },
        orderBy: { payBy: 'asc' },
        take: 15,
      }),
      db.payment.findMany({
        where: {
          status: 'failed',
          failedAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
        },
        include: {
          booking: { include: { houseSit: { include: { user: true } } } },
        },
        orderBy: [{ failedAt: 'desc' }, { updatedAt: 'desc' }],
        take: 15,
      }),
      db.booking.findMany({
        where: {
          status: 'cancelled',
          cancelledAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { cancelledAt: 'desc' },
        take: 10,
      }),
      db.dispute.findMany({
        where: {
          OR: [
            { issueType: { in: ['house_sitter_didnt_arrive', 'house_sit_no_show'] } },
            { reason: { contains: 'no-show', mode: 'insensitive' } },
          ],
          createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

  const cancellationNoShowItems = [
    ...cancelledBookings.map((booking) => ({
      id: `cancel-${booking.id}`,
      category: 'cancellation' as const,
      booking_id: booking.id,
      status: booking.status,
      reason: booking.cancellationReason ?? 'Cancelled',
      occurred_at: (booking.cancelledAt ?? booking.updatedAt).toISOString(),
    })),
    ...noShowDisputes.map((dispute) => ({
      id: `noshow-${dispute.id}`,
      category: 'no_show' as const,
      booking_id: dispute.bookingId,
      status: dispute.status,
      reason: dispute.reason,
      occurred_at: dispute.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
    .slice(0, 12)

  const pendingCleanerIds = pendingCleaners.map((houseSitter) => houseSitter.id)
  const pendingCleanerCompletedJobsAgg = pendingCleanerIds.length
    ? await db.booking.groupBy({
        by: ['houseSitterId'],
        where: {
          houseSitterId: { in: pendingCleanerIds },
          status: { in: ['completed', 'disputed'] },
        },
        _count: { _all: true },
      })
    : []
  const pendingCleanerCompletedJobsById = new Map<string, number>(
    pendingCleanerCompletedJobsAgg.map((entry) => [entry.houseSitterId, entry._count._all]),
  )

  return ok({
    pending_cleaner_approvals: {
      count: pendingCleaners.length,
      items: pendingCleaners.map((houseSitter) => ({
        id: houseSitter.id,
        profile_photo: houseSitter.profileImageUrl,
        full_name: bestEffortName(houseSitter.user?.name, houseSitter.user?.email),
        years_experience: houseSitter.yearsExperience,
        transport_method: houseSitter.transportMode,
        supplies_status: houseSitter.cleaningSupplies,
        cleaning_standards_completed: houseSitter.standardsCompleted,
        quiz_passed: houseSitter.quizPassed,
        trial_period_flag: (pendingCleanerCompletedJobsById.get(houseSitter.id) ?? 0) < 10,
        submitted_at: houseSitter.createdAt.toISOString(),
      })),
    },
    active_disputes: {
      count: activeDisputes.length,
      items: activeDisputes.map((dispute) => ({
        id: dispute.id,
        booking_id: dispute.bookingId,
        status: dispute.status,
        reason: dispute.reason,
        created_at: dispute.createdAt.toISOString(),
      })),
    },
    pending_booking_requests: {
      count: pendingBookingRequests.length,
      items: pendingBookingRequests.map((booking) => ({
        id: booking.id,
        status: booking.status,
        city: booking.city,
        scheduled_start: booking.scheduledStart.toISOString(),
        house_sitter_name: bestEffortName(booking.houseSitter.user?.name, booking.houseSitter.user?.email),
        house_sit_name: bestEffortName(booking.houseSit.user?.name, booking.houseSit.user?.email),
      })),
    },
    todays_jobs: {
      count: todayJobs.length,
      items: todayJobs.map((booking) => ({
        id: booking.id,
        status: booking.status,
        city: booking.city,
        scheduled_start: booking.scheduledStart.toISOString(),
        house_sitter_name: bestEffortName(booking.houseSitter.user?.name, booking.houseSitter.user?.email),
        house_sit_name: bestEffortName(booking.houseSit.user?.name, booking.houseSit.user?.email),
      })),
    },
    upcoming_jobs: {
      today_count: todayJobs.length,
      tomorrow_count: tomorrowJobs.length,
      today_items: todayJobs.map((booking) => ({
        id: booking.id,
        status: booking.status,
        city: booking.city,
        scheduled_start: booking.scheduledStart.toISOString(),
        house_sitter_name: bestEffortName(booking.houseSitter.user?.name, booking.houseSitter.user?.email),
        house_sit_name: bestEffortName(booking.houseSit.user?.name, booking.houseSit.user?.email),
      })),
      tomorrow_items: tomorrowJobs.map((booking) => ({
        id: booking.id,
        status: booking.status,
        city: booking.city,
        scheduled_start: booking.scheduledStart.toISOString(),
        house_sitter_name: bestEffortName(booking.houseSitter.user?.name, booking.houseSitter.user?.email),
        house_sit_name: bestEffortName(booking.houseSit.user?.name, booking.houseSit.user?.email),
      })),
    },
    payment_failures: {
      count: failedPayments.length,
      items: failedPayments.map((payment) => ({
        id: payment.id,
        booking_id: payment.bookingId,
        payment_status: payment.status,
        failed_at: payment.failedAt?.toISOString() ?? null,
        house_sit_name: bestEffortName(payment.booking.houseSit.user?.name, payment.booking.houseSit.user?.email),
      })),
    },
    payment_issues: {
      count: paymentIssues.length,
      items: paymentIssues.map((booking) => ({
        id: booking.id,
        booking_id: booking.id,
        payment_status: 'reauthorization_required',
        failed_at: booking.payBy?.toISOString() ?? null,
        house_sit_name: bestEffortName(booking.houseSit.user?.name, booking.houseSit.user?.email),
      })),
    },
    cancellations_no_shows: {
      count: cancellationNoShowItems.length,
      items: cancellationNoShowItems,
    },
    generated_at: new Date().toISOString(),
    _window_utc: {
      today_start: todayStart.toISOString(),
      today_end: todayEnd.toISOString(),
      tomorrow_start: tomorrowStart.toISOString(),
      tomorrow_end: tomorrowEnd.toISOString(),
      next_window_start: afterTomorrowStart.toISOString(),
    },
  })
})
