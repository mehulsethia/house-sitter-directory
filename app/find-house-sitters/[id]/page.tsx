import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { Clock3, MapPin, MessageSquare, ShieldCheck, Share2, Star } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import Footer from '@/components/footer'
import { PUBLIC_SITTERS } from '@/lib/public-marketplace-data'

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

export default async function PublicSitterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const sitter = PUBLIC_SITTERS.find((item) => item.id === id)
  if (!sitter) notFound()

  const signedInUser = await getSignedInUser()
  const isSignedIn = Boolean(signedInUser)
  const returnPath = `/find-house-sitters/${sitter.id}`
  const contactHref = isSignedIn ? '/house-sits/chats' : `/login?next=${encodeURIComponent(returnPath)}`
  const similar = PUBLIC_SITTERS.filter((item) => item.id !== sitter.id).slice(0, 3)

  return (
    <main className="min-h-screen bg-[#f3f3f3] text-[#111827]">
      <LandingHeader />

      <section className="pb-16 pt-10">
        <div className="max-site-width">
          <Link href="/find-house-sitters" className="mb-7 inline-flex items-center text-sm text-[#1f2937]">
            ← Back to Directory
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="rounded-[10px] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
              <div className="grid gap-5 md:grid-cols-[210px_1fr]">
                <div className="overflow-hidden rounded-[12px]">
                  <img src={sitter.image} alt={sitter.name} className="h-[230px] w-full object-cover" />
                </div>
                <div>
                  <h1 className="text-[56px] leading-[1.05]">{sitter.name}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-5 text-[15px] text-[#4b5563]">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-6 w-6" />
                      {sitter.location}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-6 w-6" />
                      {sitter.yearsExperience}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded bg-[#f1ece7] px-3 py-2 text-[15px] font-semibold text-[#1f2937]">
                      <Star className="h-5 w-5 fill-current text-[#f2b01f]" />
                      {sitter.rating.toFixed(1)}
                    </span>
                    <span className="rounded bg-[#e9edf7] px-3 py-2 text-[15px] font-semibold text-[#1f2937]">
                      £ {sitter.hourlyRate}/hr
                    </span>
                  </div>
                  <button
                    type="button"
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-[6px] border border-[#d1d5db] px-4 text-[13px] text-[#374151]"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            <aside className="rounded-[10px] border border-[#d9d1c9] bg-white p-6">
              <p className="text-[58px] leading-none text-[#5a4a3b]">£/hr</p>
              <p className="mt-2 text-sm text-[#4b5563]">Average rate</p>
              <Link
                href={contactHref}
                className="mt-8 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-[#5a4a3b] text-[13px] text-white"
              >
                <MessageSquare className="h-4 w-4" />
                Contact Sitter
              </Link>
              <div className="mt-7 space-y-4 border-t border-[#e5e7eb] pt-5">
                <p className="flex items-start gap-2 text-[16px] text-[#1f2937]">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-[#16a34a]" />
                  <span>
                    Background Checked
                    <br />
                    <span className="text-[13px] text-[#6b7280]">Verified identity and criminal check</span>
                  </span>
                </p>
                <p className="text-[16px] text-[#1f2937]">
                  Insurance Coverage
                  <br />
                  <span className="text-[13px] text-[#6b7280]">Up to £1M liability protection</span>
                </p>
                <p className="text-[16px] text-[#1f2937]">
                  Quick Response
                  <br />
                  <span className="text-[13px] text-[#6b7280]">Replies within 24 hours</span>
                </p>
              </div>
            </aside>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="rounded-[10px] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
              <div className="grid grid-cols-3 overflow-hidden rounded-[8px] bg-[#f5f5f5] text-center text-[13px]">
                <span className="bg-white px-3 py-3">Availability</span>
                <span className="px-3 py-3">About</span>
                <span className="px-3 py-3">Reviews</span>
              </div>

              <div className="mt-6 rounded-[10px] border border-[#e5e7eb] p-5">
                <h2 className="text-[38px]">Availability</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sitter.availability.map((slot) => (
                    <span key={slot} className="rounded bg-[#dcfce7] px-3 py-1 text-[12px] text-[#166534]">
                      {slot}
                    </span>
                  ))}
                </div>
                <h3 className="mt-6 text-[34px]">About</h3>
                <p className="mt-2 text-base leading-relaxed text-[#4b5563]">{sitter.about}</p>
              </div>
            </div>

            <div className="space-y-5">
              <article className="rounded-[10px] border border-[#d9d1c9] bg-white p-5">
                <h3 className="text-[44px]">Quick Stats</h3>
                <dl className="mt-4 space-y-3 text-base">
                  <div className="flex items-center justify-between">
                    <dt className="text-[#4b5563]">Response Time</dt>
                    <dd className="font-semibold">0</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#4b5563]">Total Sits</dt>
                    <dd className="font-semibold">{sitter.reviews}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-[#4b5563]">Member Since</dt>
                    <dd className="font-semibold">2026</dd>
                  </div>
                </dl>
              </article>

              <article className="rounded-[10px] border border-[#86efac] bg-[#f0fdf4] p-5">
                <h3 className="text-[40px] text-[#14532d]">Trust & Safety</h3>
                <ul className="mt-4 space-y-2 text-base text-[#166534]">
                  <li>Identity verified</li>
                  <li>Background check completed</li>
                  <li>References verified</li>
                  <li>Insurance coverage active</li>
                </ul>
              </article>

              <article className="rounded-[10px] border border-[#d9d1c9] bg-white p-5">
                <h3 className="text-[40px]">Similar Sitters</h3>
                <div className="mt-4 space-y-3">
                  {similar.map((item) => (
                    <Link key={item.id} href={`/find-house-sitters/${item.id}`} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <p className="text-base text-[#111827]">{item.name}</p>
                        <p className="text-sm text-[#6b7280]">House Sitter</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
