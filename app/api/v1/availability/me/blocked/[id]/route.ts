import { requireHouseSitter } from '@/server/auth'
import { availabilityRepo } from '@/server/repositories/availability.repo'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { ok, err } from '@/server/response'

export const DELETE = requireHouseSitter(async (_req, ctx, user) => {
  const { id } = await ctx.params
  const houseSitter = await houseSitterRepo.findByUserId(user.id)
  if (!houseSitter) return err('HouseSitter profile not found', 404)
  await availabilityRepo.deleteBlockedTime(id, houseSitter.id)
  return ok({ deleted: true })
})
