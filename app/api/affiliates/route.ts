import { NextResponse } from 'next/server'
import { getAffiliates } from '@/lib/affiliate-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await getAffiliates())
}
