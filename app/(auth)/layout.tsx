import { LandingHeader } from '@/components/landing-header'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

function getPostLoginPath(user: { user_metadata?: Record<string, unknown> }) {
  const role = typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : 'client'
  if (role === 'cleaner') return '/house-sitters/dashboard'
  if (role === 'admin') return '/admin/dashboard'
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
    redirect(getPostLoginPath(data.user))
  }

  return (
    <div className="min-h-screen bg-[#f9f6f3]">
      <LandingHeader />
      <div className="max-site-width py-8">
        <section className="brand-card rounded-[8px] border border-[#efe9e3] bg-white p-4 sm:p-6">
          <div className="mb-4 border-b border-[#efe9e3] pb-4">
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
