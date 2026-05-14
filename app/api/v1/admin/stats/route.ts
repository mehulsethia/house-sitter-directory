import { requireAdmin } from '@/server/auth'
import { db } from '@/server/db'
import { ok } from '@/server/response'

export const GET = requireAdmin(async () => {
  const [
    totalUsers,
    totalClients,
    totalCleaners,
    pendingCleaners,
    approvedHouseSitters,
    liveCleaners,
    rejectedCleaners,
    suspendedCleaners,
    totalBookings,
    activeBookings,
    completedBookings,
    releasedRevenueAgg,
    openDisputes,
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.houseSit.count(),
    db.houseSitter.count(),
    db.houseSitter.count({ where: { status: 'pending' } }),
    db.houseSitter.count({ where: { status: 'approved' } }),
    db.houseSitter.count({ where: { status: 'approved', stripeOnboardingComplete: true } }),
    db.houseSitter.count({ where: { status: 'rejected' } }),
    db.houseSitter.count({ where: { status: 'suspended' } }),
    db.booking.count(),
    db.booking.count({
      where: {
        status: { in: ['pending', 'accepted', 'confirmed', 'in_progress', 'disputed'] },
      },
    }),
    db.booking.count({ where: { status: 'completed' } }),
    db.payment.aggregate({
      _sum: { amount: true, platformFee: true },
      where: {
        status: 'transferred',
        booking: { status: 'completed' },
      },
    }),
    db.dispute.count({ where: { status: { in: ['open', 'under_review'] } } }),
  ])

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
