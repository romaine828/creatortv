import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'mp4'
    const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`

    const bytes = await file.arrayBuffer()
    const { error } = await supabaseAdmin.storage
      .from('uploads')
      .upload(safeName, Buffer.from(bytes), { contentType: file.type || 'video/mp4' })

    if (error) return NextResponse.json({ error: 'Upload failed', detail: error.message }, { status: 500 })

    const { data: publicUrlData } = supabaseAdmin.storage.from('uploads').getPublicUrl(safeName)
    return NextResponse.json({ url: publicUrlData.publicUrl })
  } catch (err) {
    return NextResponse.json({ error: 'Upload failed', detail: String(err) }, { status: 500 })
  }
}
