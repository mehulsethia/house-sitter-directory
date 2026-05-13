import { requireAdmin } from '@/server/auth'
import { cleanerRepo } from '@/server/repositories/house-sitter.repo'
import { ok } from '@/server/response'

export const GET = requireAdmin(async () => {
  const cleaners = await cleanerRepo.listPending()
  return ok(cleaners)
})
