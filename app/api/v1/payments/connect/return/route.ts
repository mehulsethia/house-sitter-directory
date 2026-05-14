import { NextRequest, NextResponse } from 'next/server'
import { resolveAppOrigin } from '@/server/app-origin'

export function GET(req: NextRequest) {
  const origin = resolveAppOrigin(req)
  return NextResponse.redirect(`${origin}/house-sitters/profile?tab=payments&stripe=connected`)
}
