import { NextResponse } from 'next/server'
import { serialize } from './serialize'

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data: serialize(data) }, { status })
}

export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status })
}

