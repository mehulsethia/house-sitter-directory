'use client'

import { useQuery } from '@tanstack/react-query'
import { toApiV1Url } from '@/lib/api-base'

async function fetchCounts(): Promise<{ unread_chats: number; pending_bookings: number; unread_notifications: number }> {
  const { getAccessToken } = await import('@/lib/auth-cache')
  const token = await getAccessToken()

  const res = await fetch(toApiV1Url('/counts'), {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) return { unread_chats: 0, pending_bookings: 0, unread_notifications: 0 }
  const json = await res.json()
  return json.data ?? { unread_chats: 0, pending_bookings: 0, unread_notifications: 0 }
}

export function useCounts() {
  return useQuery({
    queryKey: ['sidebar-counts'],
    queryFn: fetchCounts,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}
