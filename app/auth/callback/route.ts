import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { db } from '@/server/db'
import { loopsEmailService } from '@/server/services/loops-email.service'
import { pushInAppNotification } from '@/server/services/in-app-notification.service'

function bootstrapRoleFromMetadata(role: unknown): 'house_sit' | 'house_sitter' {
  return role === 'house_sitter' ? 'house_sitter' : 'house_sit'
}

function fallbackNameFromEmail(email: string) {
  const local = email.split('@')[0]?.trim()
  return local ? local.slice(0, 120) : 'User'
}

/**
 * Handles Supabase email confirmation redirects.
 * Supabase sends the user here with a `code` query param after they click
 * the verification link in their email. We exchange the code for a session
 * and redirect to the appropriate dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any),
            )
          },
        },
      },
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role as string | undefined
      const phone = user?.user_metadata?.phone as string | undefined
      const rawExperience = user?.user_metadata?.experience
      const experience =
        typeof rawExperience === 'number'
          ? Math.max(0, Math.trunc(rawExperience))
          : typeof rawExperience === 'string' && rawExperience.trim() !== ''
            ? Math.max(0, Math.trunc(Number(rawExperience)))
            : null

      // Ensure role-specific profile exists (same as authApi.sync)
      if (user) {
        try {
          const metadataName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name.trim() : ''
          const metadataPhone = typeof user.user_metadata?.phone === 'string' ? user.user_metadata.phone.trim() : ''
          const userEmail = String(user.email ?? '').trim().toLowerCase()
          const bootstrapRole = bootstrapRoleFromMetadata(user.user_metadata?.role)

          let dbUser = await db.user.findUnique({ where: { id: user.id } })
          if (!dbUser && userEmail) {
            dbUser = await db.user.create({
              data: {
                id: user.id,
                email: userEmail,
                name: metadataName || fallbackNameFromEmail(userEmail),
                role: bootstrapRole,
                ...(metadataPhone ? { phone: metadataPhone } : {}),
              },
            })
          }

          if (dbUser) {
            // Keep profile fields synced from signup metadata.
            if ((phone && phone !== dbUser.phone) || (metadataName && metadataName !== dbUser.name)) {
              await db.user.update({
                where: { id: user.id },
                data: {
                  ...(phone ? { phone } : {}),
                  ...(metadataName ? { name: metadataName } : {}),
                },
              })
            }

            if (dbUser.role === 'house_sit') {
              const existing = await db.houseSit.findFirst({ where: { userId: user.id } })
              if (!existing) {
                await db.houseSit.create({ data: { userId: user.id } })
                await pushInAppNotification({
                  userId: user.id,
                  type: 'account_created',
                  title: 'Welcome to The House Sitter Directory',
                  body: 'Your homeowner profile is ready. Start by browsing available sitters.',
                })
                try {
                  await loopsEmailService.sendClientAccountCreated({
                    email: dbUser.email,
                    fullName: dbUser.name ?? 'Homeowner',
                  })
                } catch (emailError) {
                  console.error('Failed to send houseSit account created email via Loops:', emailError)
                }
              }
            } else if (dbUser.role === 'house_sitter') {
              let existing = await db.houseSitter.findFirst({ where: { userId: user.id } })
              if (!existing) {
                existing = await db.houseSitter.create({ data: { userId: user.id, hourlyRate: 15 } })
                await pushInAppNotification({
                  userId: user.id,
                  type: 'account_created',
                  title: 'Welcome to The House Sitter Directory',
                  body: 'Your house sitter profile is created. Complete onboarding to start receiving sit requests.',
                })
                try {
                  await loopsEmailService.sendCleanerSignup({
                    email: dbUser.email,
                    fullName: dbUser.name ?? 'House Sitter',
                  })
                } catch (emailError) {
                  console.error('Failed to send houseSitter signup email via Loops:', emailError)
                }
              }
              if (existing && experience !== null && Number.isFinite(experience)) {
                await db.houseSitter.update({
                  where: { id: existing.id },
                  data: { yearsExperience: experience },
                })
              }
            }
          }
        } catch {
          // Non-fatal — app will retry via authApi.sync on page load
        }
      }

      let redirectTo = next
      if (redirectTo === '/') {
        if (role === 'house_sitter') {
          redirectTo = '/house-sitter/dashboard'
        } else {
          redirectTo = '/house-sit/dashboard'
        }
      }

      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=verification_failed`)
}
