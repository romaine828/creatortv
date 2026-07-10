import { NextRequest, NextResponse } from 'next/server'
import { getChannels, saveChannels, saveChannel, deleteChannel } from '@/lib/channel-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await getChannels())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!Array.isArray(body)) return NextResponse.json({ error: 'Expected array' }, { status: 400 })
  return NextResponse.json(await saveChannels(body))
}

export async function PUT(req: NextRequest) {
  const channel = await req.json()
  if (!channel?.id) return NextResponse.json({ error: 'Channel id required' }, { status: 400 })
  return NextResponse.json(await saveChannel(channel))
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  return NextResponse.json(await deleteChannel(id))
}
