import { NextRequest, NextResponse } from 'next/server'
import { trackClick } from '@/lib/affiliate-store'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 })
  await trackClick(code)
  return NextResponse.json({ ok: true })
}
