import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { Calendar, MapPin } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import Footer from '@/components/footer'
import { PUBLIC_HOUSE_SITS } from '@/lib/public-marketplace-data'

async function getSignedInUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Read-only for this server component.
        },
      },
    },
  )

  const { data } = await supabase.auth.getUser()
  return data.user
}

export default async function PublicHouseSitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const sit = PUBLIC_HOUSE_SITS.find((item) => item.id === id)
  if (!sit) notFound()

  const signedInUser = await getSignedInUser()
  const isSignedIn = Boolean(signedInUser)
  const returnPath = `/find-house-sits/${sit.id}`
  const applyHref = isSignedIn ? '/signup?role=cleaner' : `/login?next=${encodeURIComponent(returnPath)}`
  const messageHref = isSignedIn ? '/house-sitters/chats' : `/login?next=${encodeURIComponent(returnPath)}`

  return (
    <main className="min-h-screen bg-[#f3f3f3] text-[#111827]">
      <LandingHeader />

      <section className="pb-16 pt-10">
        <div className="max-site-width">
          <Link href="/find-house-sits" className="mb-7 inline-flex items-center text-sm text-[#1f2937]">
            ← Back to Directory
          </Link>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="overflow-hidden rounded-[10px]">
              <img src={sit.gallery[0] ?? sit.image} alt={sit.title} className="h-[250px] w-full object-cover sm:h-[320px] md:h-[380px]" />
            </div>
            <div className="overflow-hidden rounded-[10px]">
              <img src={sit.gallery[1] ?? sit.image} alt={`${sit.title} interior`} className="h-[250px] w-full object-cover sm:h-[320px] md:h-[380px]" />
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[10px] border border-[#ddd6ce] bg-white p-4 sm:p-6">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                <h1 className="text-[34px] leading-[1.08] sm:text-[44px] lg:text-[54px]">{sit.title}</h1>
                <span className="rounded bg-[#dcfce7] px-3 py-1 text-xs text-[#15803d]">{sit.statusLabel}</span>
              </div>

              <p className="mt-2 flex items-center gap-2 text-sm text-[#4b5563]">
                <MapPin className="h-4 w-4" />
                {sit.location}
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 border-b border-[#e5e7eb] pb-5 text-sm sm:grid-cols-3 sm:gap-4">
                <div>
                  <p className="text-[#6b7280]">Property Type</p>
                  <p className="font-semibold text-[#111827]">{sit.type}</p>
                </div>
                <div>
                  <p className="text-[#6b7280]">Bedrooms</p>
                  <p className="font-semibold text-[#111827]">{sit.beds}</p>
                </div>
                <div>
                  <p className="text-[#6b7280]">Bathrooms</p>
                  <p className="font-semibold text-[#111827]">{sit.baths}</p>
                </div>
              </div>

              <div className="mt-6 space-y-6 text-[#374151]">
                <div>
                  <h2 className="text-[30px] sm:text-[40px]">Description</h2>
                  <p className="mt-2 text-base leading-relaxed">{sit.description}</p>
                </div>
                <div>
                  <h2 className="text-[30px] sm:text-[40px]">Dates</h2>
                  <p className="mt-2 flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" />
                    {sit.dateRange}
                  </p>
                </div>
                <div>
                  <h2 className="text-[30px] sm:text-[40px]">Amenities</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sit.amenities.map((amenity) => (
                      <span key={amenity} className="rounded bg-[#f1ece7] px-3 py-1 text-[12px] text-[#5a4a3b]">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-[30px] sm:text-[40px]">Pets</h2>
                  <span className="mt-2 inline-flex rounded bg-[#f1ece7] px-3 py-1 text-[12px] text-[#5a4a3b]">
                    {sit.pets}
                  </span>
                </div>
                <div>
                  <h2 className="text-[30px] sm:text-[40px]">Responsibilities</h2>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-base">
                    {sit.responsibilities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <article className="rounded-[10px] border border-[#ddd6ce] bg-white p-5">
                <h3 className="text-[30px] sm:text-[40px]">Homeowner</h3>
                <div className="mt-3 flex items-center gap-3">
                  <img src={sit.homeownerAvatar} alt={sit.homeownerName} className="h-12 w-12 rounded-full object-cover" />
                  <p className="text-lg font-semibold text-[#111827]">{sit.homeownerName}</p>
                </div>
              </article>

              <article className="rounded-[10px] border border-[#ddd6ce] bg-white p-5">
                <h3 className="text-[30px] sm:text-[40px]">Compensation</h3>
                <p className="mt-2 text-base text-[#4b5563]">£ {sit.compensation}</p>
                <Link
                  href={applyHref}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-[#5a4a3b] text-[13px] text-white"
                >
                  {isSignedIn ? 'Apply Now' : 'Login to Apply'}
                </Link>
                <Link
                  href={messageHref}
                  className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-[4px] border border-[#b7aca0] text-[13px] text-[#5a4a3b]"
                >
                  Message Homeowner
                </Link>
              </article>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
