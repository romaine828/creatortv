import { NextRequest, NextResponse } from 'next/server'
import { getSiteLinks, saveSiteLinks } from '@/lib/site-links'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await getSiteLinks())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  return NextResponse.json(await saveSiteLinks(body))
}
