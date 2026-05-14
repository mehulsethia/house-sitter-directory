import { NextRequest } from 'next/server'
import { requireHouseSit } from '@/server/auth'
import { houseSitRepo } from '@/server/repositories/house-sit.repo'
import { clientFavoriteRepo } from '@/server/repositories/house-sit-favorite.repo'
import { ok } from '@/server/response'

export const DELETE = requireHouseSit(async (_req: NextRequest, ctx, user) => {
  const { houseSitterId } = await ctx.params
  let client = await houseSitRepo.findByUserId(user.id)
  if (!client) client = await houseSitRepo.create(user.id)

  await clientFavoriteRepo.remove(client.id, houseSitterId)
  return ok({ favorite: false })
})
