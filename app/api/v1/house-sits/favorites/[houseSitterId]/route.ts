import { NextRequest } from 'next/server'
import { requireHouseSit } from '@/server/auth'
import { houseSitRepo } from '@/server/repositories/house-sit.repo'
import { houseSitFavoriteRepo } from '@/server/repositories/house-sit-favorite.repo'
import { ok } from '@/server/response'

export const DELETE = requireHouseSit(async (_req: NextRequest, ctx, user) => {
  const { houseSitterId } = await ctx.params
  let houseSit = await houseSitRepo.findByUserId(user.id)
  if (!houseSit) houseSit = await houseSitRepo.create(user.id)

  await houseSitFavoriteRepo.remove(houseSit.id, houseSitterId)
  return ok({ favorite: false })
})
