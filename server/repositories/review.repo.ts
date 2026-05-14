import { db } from '../db'

const reviewSelect = {
  id: true,
  bookingId: true,
  houseSitterId: true,
  houseSitId: true,
  rating: true,
  comment: true,
  houseSitterReply: true,
  houseSitterReplyAt: true,
  isPublic: true,
  createdAt: true,
  updatedAt: true,
} as any

export const reviewRepo = {
  findByBookingId: (bookingId: string) =>
    db.review.findUnique({ where: { bookingId }, select: reviewSelect }),

  findByCleanerId: (houseSitterId: string, page: number, pageSize: number) =>
    Promise.all([
      db.review.findMany({
        where: { houseSitterId, isPublic: true },
        select: {
          ...reviewSelect,
          houseSit: { include: { user: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.review.count({ where: { houseSitterId, isPublic: true } }),
    ]),

  create: (data: {
    bookingId: string
    houseSitterId: string
    houseSitId: string
    rating: number
    comment?: string
    isPublic?: boolean
  }) =>
    db.review.create({ data, select: reviewSelect }),

  update: (id: string, data: any) =>
    db.review.update({ where: { id }, data, select: reviewSelect }),

  findById: (id: string) =>
    db.review.findUnique({
      where: { id },
      select: {
        ...reviewSelect,
        houseSitter: { select: { id: true, userId: true } },
      },
    }),
}
