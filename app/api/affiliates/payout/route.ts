import { NextRequest, NextResponse } from 'next/server'
import { recordPayout } from '@/lib/affiliate-store'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { id, amount } = await req.json()
  if (!id || typeof amount !== 'number') return NextResponse.json({ error: 'id and amount required' }, { status: 400 })
  const list = await recordPayout(id, amount)
  return NextResponse.json(list)
}
