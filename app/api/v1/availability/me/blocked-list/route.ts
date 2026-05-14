import { requireHouseSitter } from '@/server/auth'
import { availabilityRepo } from '@/server/repositories/availability.repo'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { ok, err } from '@/server/response'

export const GET = requireHouseSitter(async (_req, _ctx, user) => {
  const cleaner = await houseSitterRepo.findByUserId(user.id)
  if (!cleaner) return err('Cleaner profile not found', 404)
  const blocks = await availabilityRepo.getBlockedTimes(cleaner.id)
  return ok(blocks)
})
