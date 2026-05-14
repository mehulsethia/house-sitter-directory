import { requireHouseSitter } from '@/server/auth'
import { availabilityRepo } from '@/server/repositories/availability.repo'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { ok, err } from '@/server/response'

export const GET = requireHouseSitter(async (_req, _ctx, user) => {
  const houseSitter = await houseSitterRepo.findByUserId(user.id)
  if (!houseSitter) return err('HouseSitter profile not found', 404)
  const blocks = await availabilityRepo.getBlockedTimes(houseSitter.id)
  return ok(blocks)
})
