import { requireAdmin } from '@/server/auth'
import { db } from '@/server/db'
import { ok } from '@/server/response'

export const GET = requireAdmin(async () => {
  // Keep these reads connection-safe in serverless + PgBouncer environments
  // where pool size may be set to 1.
  const totalUsers = await db.user.count({ where: { deletedAt: null } })
  const totalClients = await db.houseSit.count()

  const houseSitterStatusAgg = await db.houseSitter.groupBy({
    by: ['status'],
    _count: { _all: true },
  })
  const houseSitterStatusCounts = new Map<string, number>(
    houseSitterStatusAgg.map((row) => [row.status, row._count._all]),
  )

  const liveCleaners = await db.houseSitter.count({
    where: { status: 'approved', stripeOnboardingComplete: true },
  })

  const bookingStatusAgg = await db.booking.groupBy({
    by: ['status'],
    _count: { _all: true },
  })
  const bookingStatusCounts = new Map<string, number>(
    bookingStatusAgg.map((row) => [row.status, row._count._all]),
  )

  const releasedRevenueAgg = await db.payment.aggregate({
    _sum: { amount: true, platformFee: true },
    where: {
      status: 'transferred',
      booking: { status: 'completed' },
    },
  })
  const openDisputes = await db.dispute.count({ where: { status: { in: ['open', 'under_review'] } } })

  const totalCleaners = houseSitterStatusAgg.reduce((sum, row) => sum + row._count._all, 0)
  const pendingCleaners = houseSitterStatusCounts.get('pending') ?? 0
  const approvedHouseSitters = houseSitterStatusCounts.get('approved') ?? 0
  const rejectedCleaners = houseSitterStatusCounts.get('rejected') ?? 0
  const suspendedCleaners = houseSitterStatusCounts.get('suspended') ?? 0

  const totalBookings = bookingStatusAgg.reduce((sum, row) => sum + row._count._all, 0)
  const activeStatuses = new Set(['pending', 'accepted', 'confirmed', 'in_progress', 'disputed'])
  const activeBookings = bookingStatusAgg
    .filter((row) => activeStatuses.has(row.status))
    .reduce((sum, row) => sum + row._count._all, 0)
  const completedBookings = bookingStatusCounts.get('completed') ?? 0

  return ok({
    total_users: totalUsers,
    total_clients: totalClients,
    total_cleaners: totalCleaners,
    pending_cleaners: pendingCleaners,
    approved_cleaners: approvedHouseSitters,
    live_cleaners: liveCleaners,
    rejected_cleaners: rejectedCleaners,
    suspended_cleaners: suspendedCleaners,
    total_bookings: totalBookings,
    active_bookings: activeBookings,
    completed_bookings: completedBookings,
    total_revenue: Number(releasedRevenueAgg._sum.amount ?? 0),
    platform_earnings: Number(releasedRevenueAgg._sum.platformFee ?? 0),
    open_disputes: openDisputes,
  })
})
