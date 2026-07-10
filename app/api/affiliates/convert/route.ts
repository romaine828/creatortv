import { NextRequest, NextResponse } from 'next/server'
import { recordConversion, ReferralTier } from '@/lib/affiliate-store'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { code, tier, subscriberEmail } = await req.json()
  if (!code || !tier || !subscriberEmail) {
    return NextResponse.json({ error: 'code, tier, subscriberEmail required' }, { status: 400 })
  }
  if (tier !== 'creator' && tier !== 'vip') {
    return NextResponse.json({ error: 'tier must be creator or vip' }, { status: 400 })
  }
  const affiliate = await recordConversion(code, tier as ReferralTier, subscriberEmail)
  if (!affiliate) return NextResponse.json({ error: 'Affiliate not found or not approved' }, { status: 404 })
  return NextResponse.json(affiliate)
}
