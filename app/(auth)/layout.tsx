import { LandingHeader } from '@/components/landing-header'
import { Bricolage_Grotesque, IBM_Plex_Mono } from 'next/font/google'

const displayFont = Bricolage_Grotesque({ subsets: ['latin'], weight: ['400', '500', '700', '800'] })
const monoFont = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'] })

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="auth-stage-bg" aria-hidden="true" />
      <LandingHeader />
      <div className="relative z-10 flex-1 px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-6xl space-y-5">
          <section className="auth-stage overflow-hidden rounded-[2rem] border border-slate-200/70">
            <div className="auth-stage__media" aria-hidden="true" />
            <div className="auth-stage__grain" aria-hidden="true" />
            <div className="relative z-10 px-5 py-7 sm:px-8 sm:py-8">
              <p className={`${monoFont.className} text-[0.7rem] uppercase tracking-[0.24em] text-white/75`}>
                MaidHive Access
              </p>
              <h1 className={`${displayFont.className} mt-2 text-4xl font-extrabold tracking-[-0.03em] text-white sm:text-5xl`}>
                Sign In & Onboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-100/90 sm:text-base">
                Access your account, create a new profile, and complete onboarding with one consistent flow.
              </p>
            </div>
          </section>

          <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_18px_45px_rgba(11,33,78,0.08)] backdrop-blur-sm">
            {children}
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-stage-bg {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 14% 0%, rgba(61, 88, 247, 0.1), transparent 32%),
            radial-gradient(circle at 100% 8%, rgba(14, 165, 233, 0.08), transparent 28%),
            linear-gradient(180deg, #f4f7ff 0%, #f7f8fc 42%, #f8fafc 100%);
        }

        .auth-stage {
          position: relative;
          isolation: isolate;
          background: linear-gradient(125deg, #04162f 8%, #0f3b76 58%, #0e5698);
        }

        .auth-stage__media {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(105deg, rgba(2, 11, 27, 0.82) 10%, rgba(2, 11, 27, 0.5) 55%, rgba(8, 22, 44, 0.72) 100%),
            url('/images/join-maidhive.avif');
          background-size: cover;
          background-position: center;
          mix-blend-mode: screen;
          opacity: 0.84;
        }

        .auth-stage__grain {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(90deg, rgba(255, 255, 255, 0.11) 0%, rgba(255, 255, 255, 0) 45%),
            radial-gradient(circle at 20% 28%, rgba(56, 220, 255, 0.22), transparent 28%),
            radial-gradient(circle at 82% 12%, rgba(244, 180, 0, 0.2), transparent 22%);
          animation: auth-sweep 11s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes auth-sweep {
          0%,
          100% {
            transform: translateX(0%);
            opacity: 1;
          }
          50% {
            transform: translateX(1.6%);
            opacity: 0.88;
          }
        }
      `}</style>
    </div>
  )
}
