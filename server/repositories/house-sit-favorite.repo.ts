import { db } from '../db'

export const houseSitFavoriteRepo = {
  listHouseSitterIdsByHouseSitId: async (houseSitId: string): Promise<string[]> => {
    const rows = await db.houseSitFavorite.findMany({
      where: { houseSitId },
      select: { houseSitterId: true },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => row.houseSitterId)
  },

  listByHouseSitId: (houseSitId: string) =>
    db.houseSitFavorite.findMany({
      where: { houseSitId },
      include: {
        houseSitter: {
          include: {
            user: true,
            serviceAreas: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),

  add: (houseSitId: string, houseSitterId: string) =>
    db.houseSitFavorite.upsert({
      where: {
        houseSitId_houseSitterId: {
          houseSitId,
          houseSitterId,
        },
      },
      update: {},
      create: { houseSitId, houseSitterId },
    }),

  remove: (houseSitId: string, houseSitterId: string) =>
    db.houseSitFavorite.deleteMany({
      where: { houseSitId, houseSitterId },
    }),
}
