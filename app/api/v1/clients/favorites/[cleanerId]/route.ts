import { NextRequest } from 'next/server'
import { requireClient } from '@/server/auth'
import { clientRepo } from '@/server/repositories/client.repo'
import { clientFavoriteRepo } from '@/server/repositories/client-favorite.repo'
import { ok } from '@/server/response'

export const DELETE = requireClient(async (_req: NextRequest, ctx, user) => {
  const { cleanerId } = await ctx.params
  let client = await clientRepo.findByUserId(user.id)
  if (!client) client = await clientRepo.create(user.id)

  await clientFavoriteRepo.remove(client.id, cleanerId)
  return ok({ favorite: false })
})

