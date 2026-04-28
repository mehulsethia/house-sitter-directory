import { db } from '../db'

export const messageRepo = {
  markReadForBooking: (bookingId: string, userId: string) =>
    db.message.updateMany({
      where: {
        bookingId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    }),

  findByBookingId: (bookingId: string) =>
    db.message.findMany({
      where: { bookingId },
      include: { sender: true },
      orderBy: { createdAt: 'asc' },
    }),

  send: (bookingId: string, senderId: string, content: string) =>
    db.message.create({
      data: { bookingId, senderId, content },
      include: { sender: true },
    }),
}
