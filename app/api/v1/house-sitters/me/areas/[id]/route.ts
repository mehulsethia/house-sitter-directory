import { requireHouseSitter } from '@/server/auth'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { ok, err } from '@/server/response'

export const DELETE = requireHouseSitter(async (_req, ctx, user) => {
  const { id } = await ctx.params
  const cleaner = await houseSitterRepo.findByUserId(user.id)
  if (!cleaner) return err('Cleaner profile not found', 404)

  await houseSitterRepo.removeServiceArea(id, cleaner.id)
  return ok({ deleted: true })
})
