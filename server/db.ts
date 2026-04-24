import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}

let schemaReadyPromise: Promise<void> | null = null

/**
 * Defensive compatibility guard:
 * ensures additive columns exist before query-heavy API paths run.
 * This prevents total data outages when a deploy ships code before SQL migration is applied.
 */
export function ensureDbSchema(): Promise<void> {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await db.$executeRawUnsafe(`
        ALTER TABLE public.cleaners
        ADD COLUMN IF NOT EXISTS id_file_url TEXT
      `)
    })().catch((error) => {
      schemaReadyPromise = null
      throw error
    })
  }
  return schemaReadyPromise
}
