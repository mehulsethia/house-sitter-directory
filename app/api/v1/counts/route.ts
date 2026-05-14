import { requireAuth } from '@/server/auth'
import { db } from '@/server/db'
import { ok } from '@/server/response'
import { notificationRepo } from '@/server/repositories/notification.repo'

export const GET = requireAuth(async (_req, _ctx, user) => {
  const userId = user.id
  const role = user.role
  const chatCutoff = new Date(Date.now() - 30 * 60 * 1000)

  // Unread chat messages (messages in my bookings, sent by others, unread)
  const bookingFilter =
    role === 'house_sitter'
      ? { houseSitter: { userId } }
      : role === 'house_sit'
        ? { houseSit: { userId } }
        : null

  const unreadChats = bookingFilter
    ? await db.message.count({
        where: {
          isRead: false,
          senderId: { not: userId },
          booking: {
            ...bookingFilter,
            status: { in: ['confirmed', 'in_progress', 'completed', 'disputed'] },
            scheduledEnd: { gte: chatCutoff },
          },
        },
      })
    : 0

  // Booking badge count
  let pendingBookings = 0
  if (role === 'house_sitter') {
    // HouseSitter: new incoming bookings awaiting accept
    pendingBookings = await db.booking.count({
      where: {
        houseSitter: { userId },
        status: 'pending',
        payment: {
          is: {
            status: { in: ['authorized', 'captured', 'transferred'] },
          },
        },
      },
    })
  } else if (role === 'house_sit') {
    // HouseSit: bookings recently accepted (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    pendingBookings = await db.booking.count({
      where: {
        houseSit: { userId },
        status: 'accepted',
        acceptedAt: { gte: sevenDaysAgo },
      },
    })
  }

  const unreadNotifications =
    role === 'admin'
      ? await (async () => {
          const adminUsers = await db.user.findMany({
            where: { role: 'admin', isActive: true },
            select: { id: true },
          })
          const adminIds = adminUsers.map((u) => u.id)
          if (adminIds.length === 0) return 0
          return notificationRepo.countUnreadForUsers(adminIds)
        })()
      : await notificationRepo.countUnread(userId)

  return ok({
    unread_chats: unreadChats,
    pending_bookings: pendingBookings,
    unread_notifications: unreadNotifications,
  })
})
