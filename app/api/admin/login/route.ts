import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, SESSION_SECONDS, createSession, passwordMatches } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let password = ''
  try { password = String((await req.json())?.password ?? '') } catch {}
  if (!(await passwordMatches(password))) {
    await new Promise(r => setTimeout(r, 1500)) // slows down guessing
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }
  const session = await createSession()
  if (!session) return NextResponse.json({ error: 'Admin login is not set up on this site yet' }, { status: 500 })
  const res = NextResponse.json({ ok: true })
  const secure = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https'
  res.cookies.set(ADMIN_COOKIE, session, { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: SESSION_SECONDS })
  return res
}
