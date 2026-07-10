import { NextResponse } from 'next/server'
import { getQAItems, addQAItem, updateQAItem, deleteQAItem } from '@/lib/community-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(await getQAItems())
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
