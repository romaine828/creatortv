import { NextRequest, NextResponse } from 'next/server'
import { getAffiliateByEmail } from '@/lib/affiliate-store'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
  const affiliate = await getAffiliateByEmail(email)
  if (!affiliate) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(affiliate)
}
