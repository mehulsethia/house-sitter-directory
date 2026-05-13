#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:3100'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env vars in .env.local')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const results = []
const artifacts = { users: {}, bookings: {} }

const pass = (area, test, details) => results.push({ area, test, status: 'PASS', details })
const fail = (area, test, details) => results.push({ area, test, status: 'FAIL', details })
const blocked = (area, test, details) => results.push({ area, test, status: 'BLOCKED', details })

const nowIso = () => new Date().toISOString()

function roundToHalfHour(input) {
  const d = new Date(input)
  d.setSeconds(0, 0)
  const m = d.getMinutes()
  if (m === 0 || m === 30) return d
  if (m < 30) d.setMinutes(30)
  else d.setHours(d.getHours() + 1, 0, 0, 0)
  return d
}

function futureIso({ days = 0, hours = 0, minutes = 0 }) {
  const ms = (((days * 24 + hours) * 60 + minutes) * 60 * 1000)
  return roundToHalfHour(Date.now() + ms).toISOString()
}

async function waitForHealth(timeoutMs = 120000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/health`)
      if (res.ok) return true
    } catch {}
    await new Promise((r) => setTimeout(r, 1500))
  }
  return false
}

function startServer() {
  const proc = spawn('npm', ['run', 'start', '--', '--hostname', '127.0.0.1', '--port', '3100'], {
    cwd: process.cwd(),
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let out = ''
  let err = ''
  proc.stdout.on('data', (d) => {
    out += d.toString()
  })
  proc.stderr.on('data', (d) => {
    err += d.toString()
  })

  return { proc, logs: () => ({ out, err }) }
}

async function api(pathname, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE_URL}${pathname}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }

  return { status: res.status, ok: res.ok, text, json }
}

async function upsertAppUser({ id, email, name, role }) {
  const { error } = await admin.from('users').upsert(
    {
      id,
      email,
      name,
      role,
      is_active: true,
      deleted_at: null,
    },
    { onConflict: 'id' },
  )
  if (error) throw new Error(`users upsert failed: ${error.message}`)
}

async function createAuthUser({ email, password, name, role }) {
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })
  if (created.error || !created.data.user) {
    throw new Error(`admin createUser failed for ${role}: ${created.error?.message || 'unknown'}`)
  }

  await upsertAppUser({ id: created.data.user.id, email, name, role })

  const login = await anon.auth.signInWithPassword({ email, password })
  if (login.error || !login.data.session?.access_token) {
    throw new Error(`signIn failed for ${role}: ${login.error?.message || 'missing token'}`)
  }

  return {
    id: created.data.user.id,
    email,
    token: login.data.session.access_token,
  }
}

async function ensureClientProfile(userId) {
  const existing = await admin.from('clients').select('id').eq('user_id', userId).maybeSingle()
  if (existing.error) throw new Error(existing.error.message)
  if (existing.data?.id) return existing.data.id

  const inserted = await admin.from('clients').insert({ user_id: userId }).select('id').single()
  if (inserted.error) throw new Error(inserted.error.message)
  return inserted.data.id
}

async function ensureCleanerProfile(userId) {
  const existing = await admin.from('cleaners').select('*').eq('user_id', userId).maybeSingle()
  if (existing.error) throw new Error(existing.error.message)
  if (existing.data?.id) return existing.data

  const inserted = await admin
    .from('cleaners')
    .insert({ user_id: userId, hourly_rate: 15 })
    .select('*')
    .single()
  if (inserted.error) throw new Error(inserted.error.message)
  return inserted.data
}

async function getBookingFinance(bookingId) {
  const row = await admin
    .from('bookings')
    .select('id,total_amount,platform_fee,cleaner_payout')
    .eq('id', bookingId)
    .single()
  if (row.error) throw new Error(row.error.message)
  return row.data
}

async function createPendingAuthorizedBooking({ clientToken, cleanerId, label, startIso, duration = 2 }) {
  const created = await api('/api/v1/bookings', {
    method: 'POST',
    token: clientToken,
    body: {
      cleaner_id: cleanerId,
      service_type: 'standard',
      special_instructions: `${label} - QA booking instructions`,
      address: '123 QA Street',
      city: 'Larnaca',
      postcode: '6020',
      country: 'CY',
      apartment_details: 'Apt 4',
      access_notes: 'Door code 1234',
      scheduled_start: startIso,
      duration_hours: duration,
    },
  })

  if (!created.ok || !created.json?.data?.id) {
    return { ok: false, reason: `create failed: ${created.status} ${created.text.slice(0, 300)}` }
  }

  const bookingId = created.json.data.id
  const amounts = await getBookingFinance(bookingId)

  const payment = await admin.from('payments').upsert(
    {
      booking_id: bookingId,
      stripe_payment_intent_id: `pi_qa_${bookingId.replace(/-/g, '').slice(0, 20)}`,
      amount: amounts.total_amount,
      platform_fee: amounts.platform_fee,
      cleaner_payout: amounts.cleaner_payout,
      currency: 'eur',
      status: 'authorized',
      authorized_at: nowIso(),
    },
    { onConflict: 'booking_id' },
  )
  if (payment.error) return { ok: false, reason: `payment upsert failed: ${payment.error.message}` }

  const bookingUpdate = await admin.from('bookings').update({ status: 'pending' }).eq('id', bookingId)
  if (bookingUpdate.error) return { ok: false, reason: `booking update failed: ${bookingUpdate.error.message}` }

  return { ok: true, bookingId }
}

async function main() {
  const server = startServer()

  try {
    const up = await waitForHealth()
    if (!up) {
      const logs = server.logs()
      throw new Error(`Server start failed\nSTDOUT:\n${logs.out}\nSTDERR:\n${logs.err}`)
    }

    const ts = Date.now()
    const password = 'QaTest!23456'

    const client = await createAuthUser({
      email: `qa-client-${ts}@testmail.com`,
      password,
      name: 'QA Client',
      role: 'client',
    })
    const sitter = await createAuthUser({
      email: `qa-sitter-${ts}@testmail.com`,
      password,
      name: 'QA House Sitter',
      role: 'cleaner',
    })

    artifacts.users = {
      client: { id: client.id, email: client.email },
      sitter: { id: sitter.id, email: sitter.email },
    }

    pass('Login/signup/onboarding', 'Account creation', 'Created test auth users via Supabase Admin')

    const meClient = await api('/api/v1/auth/me', { token: client.token })
    const meSitter = await api('/api/v1/auth/me', { token: sitter.token })
    if (meClient.ok && meSitter.ok) pass('Login/signup/onboarding', 'Login + auth session', 'Bearer auth works for both roles')
    else fail('Login/signup/onboarding', 'Login + auth session', `client=${meClient.status}, sitter=${meSitter.status}`)

    const syncClient = await api('/api/v1/auth/sync', {
      method: 'POST',
      token: client.token,
      body: { name: 'QA Client', phone: '+35799111222' },
    })
    const syncSitter = await api('/api/v1/auth/sync', {
      method: 'POST',
      token: sitter.token,
      body: { name: 'QA House Sitter', phone: '+35799111333', experience: 3 },
    })

    if (syncClient.ok && syncSitter.ok) pass('Login/signup/onboarding', 'Auth sync bootstrap', 'Sync endpoints responded 2xx')
    else fail('Login/signup/onboarding', 'Auth sync bootstrap', `client=${syncClient.status}, sitter=${syncSitter.status}`)

    await ensureClientProfile(client.id)
    const sitterProfile = await ensureCleanerProfile(sitter.id)

    const clientOnboarding = await api('/api/v1/house-sits/me', {
      method: 'PATCH',
      token: client.token,
      body: {
        name: 'QA Client',
        phone: '+35799111222',
        default_address: '123 QA Street',
        default_city: 'Larnaca',
        default_postcode: '6020',
        default_country: 'CY',
      },
    })

    const sitterOnboarding = await api('/api/v1/house-sitters/me', {
      method: 'PATCH',
      token: sitter.token,
      body: {
        bio: 'Experienced house sitter focused on pets and property care.',
        profile_image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
        skills: ['Pet Sitting', 'Plant Care', 'General Maintenance'],
        cleaning_supplies: 'own_supplies',
        years_experience: 4,
        hourly_rate: 15,
        transport_mode: 'own_car',
        id_type: 'passport',
        id_file_name: 'qa-passport.pdf',
        id_file_url: 'https://example.com/qa-passport.pdf',
        pet_acceptance: true,
        pet_comfortable: true,
        work_eligibility_answer: true,
        work_eligibility_confirmed: true,
        terms_accepted: true,
        cleaning_standards_accepted: true,
        standards_completed: true,
        quiz_passed: true,
        quiz_score: 92,
      },
    })

    const availabilitySet = await api('/api/v1/availability/me', {
      method: 'PUT',
      token: sitter.token,
      body: {
        schedules: [
          { day_of_week: 1, start_time: '09:00', end_time: '17:00', buffer_minutes: 30, is_active: true },
          { day_of_week: 3, start_time: '09:00', end_time: '17:00', buffer_minutes: 30, is_active: true },
          { day_of_week: 5, start_time: '09:00', end_time: '17:00', buffer_minutes: 30, is_active: true },
        ],
      },
    })

    await admin.from('users').update({ phone: '+35799111333', phone_verified_at: nowIso() }).eq('id', sitter.id)

    const submit = await api('/api/v1/house-sitters/me/submit', { method: 'POST', token: sitter.token, body: {} })

    if (clientOnboarding.ok && sitterOnboarding.ok && availabilitySet.ok && submit.ok) {
      pass('Login/signup/onboarding', 'Onboarding completion', 'Client/sitter onboarding + sitter submit all succeeded')
    } else {
      fail('Login/signup/onboarding', 'Onboarding completion', `client=${clientOnboarding.status}, sitter=${sitterOnboarding.status}, avail=${availabilitySet.status}, submit=${submit.status}`)
    }

    const approve = await admin
      .from('cleaners')
      .update({
        status: 'approved',
        profile_complete: true,
        stripe_onboarding_complete: true,
        stripe_account_id: `acct_qa_${String(ts).slice(-10)}`,
        identity_verified: true,
      })
      .eq('id', sitterProfile.id)

    if (approve.error) throw new Error(`Cleaner approval prep failed: ${approve.error.message}`)

    await api('/api/v1/house-sitters/me/areas', {
      method: 'POST',
      token: sitter.token,
      body: { city: 'Larnaca', postcode_prefix: '60', radius_km: 10 },
    })

    const search = await api('/api/v1/house-sitters?city=Larnaca&transport_mode=own_car&page=1&page_size=20')
    const cleaners = search.json?.data?.cleaners || []
    const found = cleaners.some((c) => c.id === sitterProfile.id)
    if (search.ok && found) pass('Sitter search/filter + profile/book flow', 'Search + filters', `Cleaner found in filtered results (${sitterProfile.id})`)
    else fail('Sitter search/filter + profile/book flow', 'Search + filters', `status=${search.status}, found=${found}`)

    const profile = await api(`/api/v1/house-sitters/${sitterProfile.id}`)
    if (profile.ok) pass('Sitter search/filter + profile/book flow', 'Profile endpoint', 'Public sitter profile loaded')
    else fail('Sitter search/filter + profile/book flow', 'Profile endpoint', `status=${profile.status}`)

    const bookingAccept = await createPendingAuthorizedBooking({
      clientToken: client.token,
      cleanerId: sitterProfile.id,
      label: 'accept-flow',
      startIso: futureIso({ days: 2, hours: 2 }),
    })

    if (!bookingAccept.ok) {
      fail('Sitter search/filter + profile/book flow', 'Booking create flow', bookingAccept.reason)
      blocked('Booking state transitions', 'Pending -> Confirmed (accept)', 'Blocked by booking creation failure')
      blocked('Booking state transitions', 'Pending -> Declined', 'Blocked by booking creation failure')
      blocked('Alternate proposal, Rescheduling, Accept/Decline/Counter', 'Proposal/counter/accept', 'Blocked by booking creation failure')
      blocked('Messaging', 'Send + fetch booking chat', 'Blocked by booking creation failure')
      blocked('Notifications/payments statuses', 'Payment status endpoint', 'Blocked by booking creation failure')
      blocked('Notifications/payments statuses', 'In-app notifications', 'Blocked by booking creation failure')
    } else {
      pass('Sitter search/filter + profile/book flow', 'Booking create flow', `Created booking ${bookingAccept.bookingId}`)

      const accept = await api(`/api/v1/bookings/${bookingAccept.bookingId}/action`, {
        method: 'POST',
        token: sitter.token,
        body: { action: 'accept' },
      })
      if (accept.ok && accept.json?.data?.status === 'confirmed') pass('Booking state transitions', 'Pending -> Confirmed (accept)', `booking=${bookingAccept.bookingId}`)
      else fail('Booking state transitions', 'Pending -> Confirmed (accept)', `status=${accept.status}`)

      const bookingDecline = await createPendingAuthorizedBooking({
        clientToken: client.token,
        cleanerId: sitterProfile.id,
        label: 'decline-flow',
        startIso: futureIso({ days: 3, hours: 2 }),
      })
      if (!bookingDecline.ok) {
        fail('Booking state transitions', 'Pending -> Declined', bookingDecline.reason)
      } else {
        const decline = await api(`/api/v1/bookings/${bookingDecline.bookingId}/action`, {
          method: 'POST',
          token: sitter.token,
          body: { action: 'decline' },
        })
        if (decline.ok && decline.json?.data?.status === 'declined') pass('Booking state transitions', 'Pending -> Declined', `booking=${bookingDecline.bookingId}`)
        else fail('Booking state transitions', 'Pending -> Declined', `status=${decline.status}`)
      }

      const bookingProposal = await createPendingAuthorizedBooking({
        clientToken: client.token,
        cleanerId: sitterProfile.id,
        label: 'proposal-flow',
        startIso: futureIso({ days: 4, hours: 2 }),
      })
      if (!bookingProposal.ok) {
        fail('Alternate proposal, Rescheduling, Accept/Decline/Counter', 'Proposal/counter/accept', bookingProposal.reason)
      } else {
        const p1 = await api(`/api/v1/bookings/${bookingProposal.bookingId}/action`, {
          method: 'POST',
          token: sitter.token,
          body: { action: 'propose_alternative', proposed_start: futureIso({ days: 4, hours: 4 }) },
        })
        const p2 = await api(`/api/v1/bookings/${bookingProposal.bookingId}/action`, {
          method: 'POST',
          token: client.token,
          body: { action: 'counter_proposal', proposed_start: futureIso({ days: 4, hours: 5 }) },
        })
        const p3 = await api(`/api/v1/bookings/${bookingProposal.bookingId}/action`, {
          method: 'POST',
          token: sitter.token,
          body: { action: 'accept_proposal' },
        })
        if (p1.ok && p2.ok && p3.ok) pass('Alternate proposal, Rescheduling, Accept/Decline/Counter', 'Proposal/counter/accept', `booking=${bookingProposal.bookingId}`)
        else fail('Alternate proposal, Rescheduling, Accept/Decline/Counter', 'Proposal/counter/accept', `propose=${p1.status}, counter=${p2.status}, accept=${p3.status}`)
      }

      const msgSend = await api(`/api/v1/messages/${bookingAccept.bookingId}`, {
        method: 'POST',
        token: client.token,
        body: { content: `QA ping ${nowIso()}` },
      })
      const msgList = await api(`/api/v1/messages/${bookingAccept.bookingId}`, {
        method: 'GET',
        token: sitter.token,
      })
      if (msgSend.ok && msgList.ok && Array.isArray(msgList.json?.data) && msgList.json.data.length > 0) {
        pass('Messaging', 'Send + fetch booking chat', `booking=${bookingAccept.bookingId}, messages=${msgList.json.data.length}`)
      } else {
        fail('Messaging', 'Send + fetch booking chat', `send=${msgSend.status}, list=${msgList.status}`)
      }

      const payment = await api(`/api/v1/payments/${bookingAccept.bookingId}`, { token: client.token })
      if (payment.ok && payment.json?.data?.status === 'authorized') pass('Notifications/payments statuses', 'Payment status endpoint', `booking=${bookingAccept.bookingId}`)
      else fail('Notifications/payments statuses', 'Payment status endpoint', `status=${payment.status}`)

      const nClient = await api('/api/v1/notifications?page=1&page_size=20', { token: client.token })
      const nSitter = await api('/api/v1/notifications?page=1&page_size=20', { token: sitter.token })
      const countClient = Array.isArray(nClient.json?.data?.notifications) ? nClient.json.data.notifications.length : 0
      const countSitter = Array.isArray(nSitter.json?.data?.notifications) ? nSitter.json.data.notifications.length : 0
      if (nClient.ok && nSitter.ok && countClient > 0 && countSitter > 0) {
        pass('Notifications/payments statuses', 'In-app notifications', `client=${countClient}, sitter=${countSitter}`)
      } else {
        fail('Notifications/payments statuses', 'In-app notifications', `client=${nClient.status}/${countClient}, sitter=${nSitter.status}/${countSitter}`)
      }

      artifacts.bookings.booking_accept = bookingAccept.bookingId
    }

    const availabilityGet = await api('/api/v1/availability/me', { token: sitter.token })
    if (availabilityGet.ok && Array.isArray(availabilityGet.json?.data) && availabilityGet.json.data.length > 0) {
      pass('Availability setup', 'Save + fetch schedule', `slots=${availabilityGet.json.data.length}`)
    } else {
      fail('Availability setup', 'Save + fetch schedule', `status=${availabilityGet.status}`)
    }
  } finally {
    if (server?.proc && !server.proc.killed) server.proc.kill('SIGTERM')
  }

  const outPath = path.resolve(process.cwd(), 'docs/qa-manual-matrix.json')
  fs.writeFileSync(outPath, JSON.stringify({ generated_at: nowIso(), base_url: BASE_URL, artifacts, results }, null, 2))

  const failed = results.filter((r) => r.status === 'FAIL').length
  const blockedCount = results.filter((r) => r.status === 'BLOCKED').length
  console.log(JSON.stringify({ outPath, total: results.length, failed, blocked: blockedCount, passed: results.length - failed - blockedCount }, null, 2))

  if (failed > 0) process.exit(2)
}

main().catch((err) => {
  console.error(err?.stack || String(err))
  process.exit(1)
})
