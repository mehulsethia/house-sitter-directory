import { LandingHeader } from '@/components/landing-header'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/server/db'
import { computeCleanerOnboardingProgress } from '@/server/services/house-sitter-onboarding.service'

function normalizeRole(role: unknown): 'house_sit' | 'house_sitter' | 'admin' {
  if (role === 'admin') return 'admin'
  if (role === 'house_sitter' || role === 'house-sitter' || role === 'cleaner') return 'house_sitter'
  return 'house_sit'
}

function fallbackNameFromEmail(email: string) {
  const local = email.split('@')[0]?.trim()
  return local ? local.slice(0, 120) : 'User'
}

async function resolvePostLoginPath(authUser: {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown>
}) {
  const metadataRole = normalizeRole(authUser.user_metadata?.role)
  const metadataName = typeof authUser.user_metadata?.name === 'string' ? authUser.user_metadata.name.trim() : ''
  const metadataPhone = typeof authUser.user_metadata?.phone === 'string' ? authUser.user_metadata.phone.trim() : ''
  const normalizedEmail = String(authUser.email ?? '').trim().toLowerCase()

  let dbUser = await db.user.findUnique({ where: { id: authUser.id } })
  if (!dbUser && normalizedEmail) {
    dbUser = await db.user.create({
      data: {
        id: authUser.id,
        email: normalizedEmail,
        name: metadataName || fallbackNameFromEmail(normalizedEmail),
        role: metadataRole,
        ...(metadataPhone ? { phone: metadataPhone } : {}),
      },
    })
  }

  const resolvedRole = (dbUser?.role as 'house_sit' | 'house_sitter' | 'admin' | undefined) ?? metadataRole

  if (resolvedRole === 'admin') {
    return '/admin/dashboard'
  }

  if (resolvedRole === 'house_sitter') {
    let houseSitter = await db.houseSitter.findUnique({ where: { userId: authUser.id } })
    if (!houseSitter) {
      houseSitter = await db.houseSitter.create({
        data: { userId: authUser.id, hourlyRate: 15 },
      })
    }
    const availabilityCount = await db.availabilitySchedule.count({
      where: { houseSitterId: houseSitter.id, isActive: true },
    })
    const onboarding = computeCleanerOnboardingProgress({
      houseSitter,
      hasAvailabilitySlots: availabilityCount > 0,
    })
    return onboarding.completion_pct === 100
      ? '/house-sitters/dashboard'
      : '/house-sitters/onboarding'
  }

  let houseSit = await db.houseSit.findUnique({ where: { userId: authUser.id } })
  if (!houseSit) {
    houseSit = await db.houseSit.create({ data: { userId: authUser.id } })
  }

  return '/house-sits/dashboard'
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {
        // Read-only in layout
      },
    },
  })

  const { data } = await supabase.auth.getUser()
  if (data.user) {
    const postLoginPath = await resolvePostLoginPath(data.user)
    redirect(postLoginPath)
  }

  return (
    <div className="min-h-screen bg-[#f9f6f3]">
      <LandingHeader />
      <div className="max-site-width py-8">
        <section className="brand-card rounded-[8px] border border-[#efe9e3] bg-white p-4 sm:p-6">
          <div className="mb-4 border-b border-[#efe9e3] pb-4 text-center">
            <p className="text-sm text-[#5a4a3b]">The House Sitter Directory Access</p>
            <h1 className="mt-1 text-3xl">Sign In & Join</h1>
            <p className="mt-2 text-sm text-[#6b6b6b]">Access your account or create one to continue.</p>
          </div>
          {children}
        </section>
      </div>
    </div>
  )
}
