import { NextRequest, NextResponse } from 'next/server'
import { getProducts, addProduct, updateProduct, deleteProduct, getStoreSettings, saveStoreSettings } from '@/lib/store-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ products: await getProducts(), settings: await getStoreSettings() })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (body._action === 'settings') {
    return NextResponse.json(await saveStoreSettings(body))
  }
  if (!body.name || !body.price) return NextResponse.json({ error: 'Name and price required' }, { status: 400 })
  return NextResponse.json(await addProduct(body), { status: 201 })
}

export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const updated = await updateProduct(id, data)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  return NextResponse.json({ success: await deleteProduct(id) })
}
