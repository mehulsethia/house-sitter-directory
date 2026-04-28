'use client'

const COUNTS_REFRESH_EVENT = 'maidhive:counts-refresh'

export function triggerCountsRefresh() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(COUNTS_REFRESH_EVENT))
}

export function subscribeCountsRefresh(onRefresh: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(COUNTS_REFRESH_EVENT, onRefresh)
  return () => window.removeEventListener(COUNTS_REFRESH_EVENT, onRefresh)
}
