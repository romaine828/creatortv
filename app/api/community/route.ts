import { NextResponse } from 'next/server'
import { getCommunityPosts, addCommunityPost, updateCommunityPost, deleteCommunityPost } from '@/lib/community-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await getCommunityPosts())
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, message, emoji = '🙌' } = body
  if (!name?.trim() || !message?.trim()) return NextResponse.json({ error: 'Name and message required' }, { status: 400 })
  if (message.length > 500) return NextResponse.json({ error: 'Message too long' }, { status: 400 })
  return NextResponse.json(await addCommunityPost({ name: name.trim(), message: message.trim(), emoji }), { status: 201 })
}

export async function PUT(req: Request) {
  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const updated = await updateCommunityPost(id, updates)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await deleteCommunityPost(id); return NextResponse.json({ ok: true })
}
