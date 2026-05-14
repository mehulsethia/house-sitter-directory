import { db } from '../db'
import { Prisma } from '@prisma/client'

const include = {
  booking: {
    include: {
      payment: true,
    },
  },
} satisfies Prisma.BookingFlowDraftInclude

export const bookingFlowDraftRepo = {
  findByHouseSitAndHouseSitter: (houseSitId: string, houseSitterId: string) =>
    db.bookingFlowDraft.findUnique({
      where: { houseSitId_houseSitterId: { houseSitId, houseSitterId } },
      include,
    }),

  upsertByHouseSitAndHouseSitter: (args: {
    houseSitId: string
    houseSitterId: string
    bookingId?: string | null
    lastStep: number
    durationHours?: number | null
    selectedDate?: string | null
    selectedSlot?: Date | null
    payload?: Prisma.InputJsonValue | null
  }) =>
    db.bookingFlowDraft.upsert({
      where: { houseSitId_houseSitterId: { houseSitId: args.houseSitId, houseSitterId: args.houseSitterId } },
      create: {
        houseSitId: args.houseSitId,
        houseSitterId: args.houseSitterId,
        bookingId: args.bookingId ?? null,
        lastStep: args.lastStep,
        durationHours: args.durationHours ?? null,
        selectedDate: args.selectedDate ?? null,
        selectedSlot: args.selectedSlot ?? null,
        payload: args.payload ?? Prisma.JsonNull,
      },
      update: {
        bookingId: args.bookingId ?? null,
        lastStep: args.lastStep,
        durationHours: args.durationHours ?? null,
        selectedDate: args.selectedDate ?? null,
        selectedSlot: args.selectedSlot ?? null,
        payload: args.payload ?? Prisma.JsonNull,
      },
      include,
    }),

  clearByHouseSitAndHouseSitter: (houseSitId: string, houseSitterId: string) =>
    db.bookingFlowDraft.deleteMany({
      where: { houseSitId, houseSitterId },
    }),

  clearByBookingId: (bookingId: string) =>
    db.bookingFlowDraft.deleteMany({ where: { bookingId } }),
}
