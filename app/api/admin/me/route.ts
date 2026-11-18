import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifySession } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

// Tells the page whether to show owner-only buttons. Not a security boundary:
// the real checks happen in middleware.ts before any admin API runs.
export async function GET(req: NextRequest) {
  const admin = await verifySession(req.cookies.get(ADMIN_COOKIE)?.value)
  return NextResponse.json({ admin })
}
