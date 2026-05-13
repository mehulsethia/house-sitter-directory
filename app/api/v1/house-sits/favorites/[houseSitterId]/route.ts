import { NextRequest } from 'next/server'
import { requireClient } from '@/server/auth'
import { clientRepo } from '@/server/repositories/house-sit.repo'
import { clientFavoriteRepo } from '@/server/repositories/house-sit-favorite.repo'
import { ok } from '@/server/response'

export const DELETE = requireClient(async (_req: NextRequest, ctx, user) => {
  const { houseSitterId } = await ctx.params
  let client = await clientRepo.findByUserId(user.id)
  if (!client) client = await clientRepo.create(user.id)

  await clientFavoriteRepo.remove(client.id, houseSitterId)
  return ok({ favorite: false })
})
