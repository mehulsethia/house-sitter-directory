import { db } from '@/server/db'
import { config } from '@/server/config'
import { isLikelyE164, normalizePhoneE164 } from '@/server/lib/phone'

const SEND_LIMIT_PER_HOUR = 5
const VERIFY_LIMIT_PER_HOUR = 10
const WINDOW_MS = 60 * 60 * 1000

type VerifyEventType = 'send' | 'verify'

function twilioAuthHeader() {
  const token = Buffer.from(`${config.TWILIO_ACCOUNT_SID}:${config.TWILIO_AUTH_TOKEN}`).toString('base64')
  return `Basic ${token}`
}

function requireTwilioConfig() {
  if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN || !config.TWILIO_VERIFY_SERVICE_SID) {
    throw new Error('Phone verification is not configured.')
  }
}

async function countRecent(phone: string, eventType: VerifyEventType) {
  const since = new Date(Date.now() - WINDOW_MS)
  return db.phoneVerificationEvent.count({
    where: {
      phone,
      eventType,
      createdAt: { gte: since },
    },
  })
}

async function trackEvent(userId: string, phone: string, eventType: VerifyEventType, success: boolean) {
  await db.phoneVerificationEvent.create({
    data: { userId, phone, eventType, success },
  })
}

export async function sendPhoneOtp(userId: string, phoneInput: string) {
  requireTwilioConfig()
  const phone = normalizePhoneE164(phoneInput)
  if (!isLikelyE164(phone)) throw new Error('Enter a valid phone number in international format.')

  const sentRecently = await countRecent(phone, 'send')
  if (sentRecently >= SEND_LIMIT_PER_HOUR) {
    throw new Error('Too many OTP requests. Please try again in an hour.')
  }

  const body = new URLSearchParams({ To: phone, Channel: 'sms' })
  const res = await fetch(
    `https://verify.twilio.com/v2/Services/${config.TWILIO_VERIFY_SERVICE_SID}/Verifications`,
    {
      method: 'POST',
      headers: {
        Authorization: twilioAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    },
  )
  const json = (await res.json().catch(() => ({}))) as { status?: string; message?: string }
  const ok = res.ok && (json.status === 'pending' || json.status === 'sent')
  await trackEvent(userId, phone, 'send', ok)
  if (!ok) throw new Error(json.message || 'Failed to send verification code.')
}

export async function checkPhoneOtp(userId: string, phoneInput: string, code: string) {
  requireTwilioConfig()
  const phone = normalizePhoneE164(phoneInput)
  if (!isLikelyE164(phone)) throw new Error('Enter a valid phone number in international format.')

  const verifyAttempts = await countRecent(phone, 'verify')
  if (verifyAttempts >= VERIFY_LIMIT_PER_HOUR) {
    throw new Error('Too many verification attempts. Please try again in an hour.')
  }

  const body = new URLSearchParams({ To: phone, Code: code.trim() })
  const res = await fetch(
    `https://verify.twilio.com/v2/Services/${config.TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`,
    {
      method: 'POST',
      headers: {
        Authorization: twilioAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    },
  )
  const json = (await res.json().catch(() => ({}))) as { status?: string; message?: string }
  const approved = res.ok && json.status === 'approved'
  await trackEvent(userId, phone, 'verify', approved)
  if (!approved) throw new Error(json.message || 'Invalid verification code.')

  await db.user.update({
    where: { id: userId },
    data: {
      phone,
      phoneVerifiedAt: new Date(),
    },
  })
}
