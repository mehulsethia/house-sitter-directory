import { requireAdmin } from '@/server/auth'
import { houseSitterRepo } from '@/server/repositories/house-sitter.repo'
import { ok } from '@/server/response'

export const GET = requireAdmin(async () => {
  const cleaners = await houseSitterRepo.listPending()
  return ok(cleaners)
})
