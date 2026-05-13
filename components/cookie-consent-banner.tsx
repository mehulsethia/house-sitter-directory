'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const CONSENT_KEY = 'house_sitter_directory_cookie_consent_v1'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const value = window.localStorage.getItem(CONSENT_KEY)
    if (!value) setVisible(true)
  }, [])

  function saveConsent(mode: 'accepted' | 'declined') {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ mode, timestamp: new Date().toISOString() }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-[#ece6e0] bg-white/95 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm">
      <div className="max-site-width flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[#6b6b6b]">
          We use cookies to improve performance and your experience. See our{' '}
          <Link href="/privacy-policy" className="text-[#5a4a3b] hover:underline">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link href="/terms-and-conditions" className="text-[#5a4a3b] hover:underline">
            Terms of Service
          </Link>
          .
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => saveConsent('declined')}
            className="h-10 rounded-[4px] border border-[#5a4a3b] px-4 text-[#5a4a3b]"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => saveConsent('accepted')}
            className="h-10 rounded-[4px] bg-[#5a4a3b] px-4 text-white"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
