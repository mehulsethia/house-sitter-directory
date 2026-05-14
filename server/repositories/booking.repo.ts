import { db } from '../db'
import type { Prisma } from '@prisma/client'

const bookingInclude = {
  houseSit: {
    include: {
      user: true,
      _count: {
        select: {
          bookings: {
            where: { status: 'completed' },
          },
        },
      },
    },
  },
  houseSitter: { include: { user: true } },
  payment: true,
  review: true,
} satisfies Prisma.BookingInclude

export const bookingRepo = {
  findById: (id: string) =>
    db.booking.findUnique({ where: { id }, include: bookingInclude }),

  findByClient: (houseSitId: string, params: { page: number; pageSize: number; status?: string }) => {
    const where: Prisma.BookingWhereInput = {
      houseSitId,
      ...(params.status ? { status: params.status } : {}),
    }
    return Promise.all([
      db.booking.findMany({
        where,
        include: bookingInclude,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.booking.count({ where }),
    ])
  },

  findByCleaner: (houseSitterId: string, params: { page: number; pageSize: number; status?: string }) => {
    const where: Prisma.BookingWhereInput = {
      houseSitterId,
      ...(params.status ? { status: params.status } : {}),
      NOT: { status: 'draft' },
      OR: [
        { status: { notIn: ['pending', 'draft', 'cancelled'] } },
        {
          status: 'pending',
          payment: {
            is: {
              status: { in: ['authorized', 'captured', 'transferred'] },
            },
          },
        },
        {
          status: 'cancelled',
          OR: [
            { acceptedAt: { not: null } },
            { confirmedAt: { not: null } },
            { startedAt: { not: null } },
            {
              payment: {
                is: {
                  OR: [
                    { authorizedAt: { not: null } },
                    { capturedAt: { not: null } },
                    { transferredAt: { not: null } },
                  ],
                },
              },
            },
          ],
        },
      ],
    }
    return Promise.all([
      db.booking.findMany({
        where,
        include: bookingInclude,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.booking.count({ where }),
    ])
  },

  create: (data: {
    houseSitId: string
    houseSitterId: string
    serviceType: string
    specialInstructions?: string
    address: string
    city: string
    postcode: string
    country: string
    apartmentDetails?: string
    accessNotes: string
    scheduledStart: Date
    scheduledEnd: Date
    durationHours: number
    hourlyRate: number
    subtotal: number
    platformFeePct: number
    platformFee: number
    houseSitterPayout: number
    totalAmount: number
    acceptBy: Date
    originalScheduledStart?: Date
    status?: string
  }) =>
    db.booking.create({ data, include: bookingInclude }),

  update: (id: string, data: Prisma.BookingUpdateInput) =>
    db.booking.update({ where: { id }, data, include: bookingInclude }),

  findOverlappingDraftForClient: (params: {
    houseSitId: string
    houseSitterId: string
    start: Date
    end: Date
  }) =>
    db.booking.findFirst({
      where: {
        houseSitId: params.houseSitId,
        houseSitterId: params.houseSitterId,
        status: 'draft',
        scheduledStart: { lt: params.end },
        scheduledEnd: { gt: params.start },
      },
      include: bookingInclude,
      orderBy: { updatedAt: 'desc' },
    }),

  listAll: (params: { status?: string; page: number; pageSize: number }) => {
    const statuses = params.status
      ? params.status
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
    const includesFailedPayments = statuses.includes('failed_payments')
    const filteredStatuses = statuses.filter((s) => s !== 'failed_payments')
    const baseStatusWhere: Prisma.BookingWhereInput =
      filteredStatuses.length > 0
        ? filteredStatuses.length === 1
          ? { status: filteredStatuses[0] as any }
          : { status: { in: filteredStatuses as any[] } }
        : {}
    const where: Prisma.BookingWhereInput = includesFailedPayments
      ? {
          ...baseStatusWhere,
          payment: { is: { status: 'failed' } },
        }
      : baseStatusWhere
    return Promise.all([
      db.booking.findMany({
        where,
        include: bookingInclude,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.booking.count({ where }),
    ])
  },

  findActiveForCleaner: (houseSitterId: string, start: Date, end: Date) =>
    {
      const now = new Date()
      return db.booking.findMany({
        where: {
          houseSitterId,
          AND: [
            {
              OR: [
                {
                  status: { in: ['accepted', 'confirmed', 'in_progress', 'completed', 'disputed'] },
                },
                {
                  status: 'pending',
                  acceptBy: { gt: now },
                  payment: {
                    is: {
                      status: { in: ['authorized', 'captured', 'transferred'] },
                    },
                  },
                },
              ],
            },
            {
              OR: [
                { scheduledStart: { lt: end }, scheduledEnd: { gt: start } },
                {
                  proposedStart: { not: null, lt: end },
                  proposedEnd: { not: null, gt: start },
                  OR: [
                    {
                      status: 'pending',
                      acceptBy: { gt: now },
                      payment: {
                        is: {
                          status: { in: ['authorized', 'captured', 'transferred'] },
                        },
                      },
                    },
                    {
                      status: { in: ['accepted', 'confirmed'] },
                      proposalContext: { in: ['post_confirmation', 'amend_start'] },
                      proposalExpiresAt: { gt: now },
                    },
                  ],
                },
              ],
            },
          ],
        },
      })
    },
}
