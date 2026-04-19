'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const CONSENT_KEY = 'maidhive_cookie_consent_v1'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const value = window.localStorage.getItem(CONSENT_KEY)
    if (!value) {
      setVisible(true)
    }
  }, [])

  function saveConsent(mode: 'accepted' | 'declined') {
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ mode, timestamp: new Date().toISOString() }),
    )
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-slate-200 bg-white/95 backdrop-blur-sm shadow-[0_-10px_30px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-700">
          We use cookies to improve site performance and your experience. See our{' '}
          <Link href="/privacy-policy" className="font-semibold text-primary hover:underline">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link href="/terms-and-conditions" className="font-semibold text-primary hover:underline">
            Terms
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => saveConsent('declined')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => saveConsent('accepted')}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
