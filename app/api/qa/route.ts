import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getQAItems, addQAItem, updateQAItem, deleteQAItem } from '@/lib/community-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const items = await getQAItems()
  const isAdmin = (await headers()).get('x-admin') === '1'
  if (isAdmin) return NextResponse.json(items)
  // Visitors only see answered or featured questions, and never the asker's email address.
  return NextResponse.json(items.filter(i => i.answer || i.featured).map(({ email, ...safe }) => safe))
}

export async function POST(req: Request) {
  const { question, name, email, category = 'general' } = await req.json()
  if (!question?.trim() || !name?.trim()) return NextResponse.json({ error: 'Name and question required' }, { status: 400 })
  return NextResponse.json(await addQAItem({ question: question.trim(), name: name.trim(), email, category }), { status: 201 })
}

export async function PUT(req: Request) {
  const { id, ...updates } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const updated = await updateQAItem(id, updates)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await deleteQAItem(id); return NextResponse.json({ ok: true })
}
