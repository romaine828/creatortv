import { NextRequest, NextResponse } from 'next/server'
import { updateAffiliateStatus } from '@/lib/affiliate-store'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })
  const list = await updateAffiliateStatus(id, status)
  return NextResponse.json(list)
}
