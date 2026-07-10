import { NextRequest, NextResponse } from 'next/server'
import { getExclusiveItems, addExclusiveItem, updateExclusiveItem, deleteExclusiveItem } from '@/lib/exclusive-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await getExclusiveItems())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body?.title) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  return NextResponse.json(await addExclusiveItem(body))
}

export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  return NextResponse.json(await updateExclusiveItem(id, updates))
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  return NextResponse.json(await deleteExclusiveItem(id))
}
