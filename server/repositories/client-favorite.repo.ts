import { db } from '../db'

export const clientFavoriteRepo = {
  listCleanerIdsByClientId: async (clientId: string): Promise<string[]> => {
    const rows = await db.clientFavorite.findMany({
      where: { clientId },
      select: { cleanerId: true },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => row.cleanerId)
  },

  listByClientId: (clientId: string) =>
    db.clientFavorite.findMany({
      where: { clientId },
      include: {
        cleaner: {
          include: {
            user: true,
            serviceAreas: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),

  add: (clientId: string, cleanerId: string) =>
    db.clientFavorite.upsert({
      where: {
        clientId_cleanerId: {
          clientId,
          cleanerId,
        },
      },
      update: {},
      create: { clientId, cleanerId },
    }),

  remove: (clientId: string, cleanerId: string) =>
    db.clientFavorite.deleteMany({
      where: { clientId, cleanerId },
    }),
}

