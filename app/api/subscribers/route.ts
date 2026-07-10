import { NextRequest, NextResponse } from 'next/server'
import { getSubscribers, addSubscriber } from '@/lib/subscribers-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await getSubscribers())
}

export async function POST(req: NextRequest) {
  const { name, email, channelId, plan } = await req.json()
  if (!name || !email || !channelId) {
    return NextResponse.json({ error: 'name, email, channelId required' }, { status: 400 })
  }
  const result = await addSubscriber({ name, email, channelId, plan: plan || 'free', subscribedAt: new Date().toISOString() })
  return NextResponse.json(result)
}
