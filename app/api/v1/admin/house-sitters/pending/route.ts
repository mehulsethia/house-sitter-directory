import { requireAdmin } from '@/server/auth'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { ok } from '@/server/response'

export const GET = requireAdmin(async () => {
  const house_sitters = await houseSitterRepo.listPending()
  return ok(house_sitters)
})
