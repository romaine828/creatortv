import { NextRequest, NextResponse } from 'next/server'
import { applyAsAffiliate } from '@/lib/affiliate-store'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { name, email } = await req.json()
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
  }
  const affiliate = await applyAsAffiliate(name.trim(), email.trim())
  return NextResponse.json(affiliate)
}
