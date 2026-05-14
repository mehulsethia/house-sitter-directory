import { db } from '../db'
import { Prisma } from '@prisma/client'

function isMissingColumnError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2022'
}

export const houseSitRepo = {
  findById: async (id: string) => {
    try {
      return await db.houseSit.findUnique({ where: { id }, include: { user: true } })
    } catch (error) {
      if (!isMissingColumnError(error)) throw error
      // Backward-compatible fallback when additive columns are missing in DB.
      return db.houseSit.findUnique({
        where: { id },
        select: {
          id: true,
          userId: true,
          stripeCustomerId: true,
          defaultAddress: true,
          defaultCity: true,
          defaultPostcode: true,
          defaultCountry: true,
          createdAt: true,
          updatedAt: true,
          user: true,
        },
      })
    }
  },

  findByUserId: async (userId: string) => {
    try {
      return await db.houseSit.findUnique({ where: { userId }, include: { user: true } })
    } catch (error) {
      if (!isMissingColumnError(error)) throw error
      // Backward-compatible fallback when additive columns are missing in DB.
      return db.houseSit.findUnique({
        where: { userId },
        select: {
          id: true,
          userId: true,
          stripeCustomerId: true,
          defaultAddress: true,
          defaultCity: true,
          defaultPostcode: true,
          defaultCountry: true,
          createdAt: true,
          updatedAt: true,
          user: true,
        },
      })
    }
  },

  create: (userId: string) =>
    db.houseSit.create({ data: { userId }, include: { user: true } }),

  update: (id: string, data: Partial<{
    stripeCustomerId: string
    defaultAddress: string | null
    defaultCity: string | null
    defaultPostcode: string | null
    defaultCountry: string
    idFileName: string | null
    idFileUrl: string | null
    idSubmittedAt: Date | null
  }>) =>
    db.houseSit.update({ where: { id }, data }),
}
