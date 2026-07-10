"use client"

import { useState, useEffect, useRef } from "react"
import { Star, Plus, Trash, Edit2, Save, X, Upload, Loader2, ExternalLink } from "lucide-react"

interface ExclusiveItem {
  id: string
  emoji: string
  title: string
  description: string
  url: string
  buttonLabel: string
  createdAt: string
}

const EMOJI_OPTIONS = ['🎬', '🎙️', '📚', '🎵', '📸', '💬', '🎁', '⭐']

export function ExclusiveContentManager() {
  const [items, setItems] = useState<ExclusiveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [emoji, setEmoji] = useState('🎬')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [buttonLabel, setButtonLabel] = useState('Watch ▶')

  const load = () => {
    fetch('/api/exclusive-content').then(r => r.json()).then(data => {
      setItems(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setEmoji('🎬'); setTitle(''); setDescription(''); setUrl(''); setButtonLabel('Watch ▶')
    setEditingId(null)
  }

  const startEdit = (item: ExclusiveItem) => {
    setEmoji(item.emoji); setTitle(item.title); setDescription(item.description)
    setUrl(item.url); setButtonLabel(item.buttonLabel)
    setEditingId(item.id)
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setUrl(data.url)
      else alert('Upload failed: ' + (data.error || 'unknown error'))
    } catch {
      alert('Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !url.trim()) {
      alert('Please add a title and a link/file for this content.')
      return
    }
    if (editingId) {
      await fetch('/api/exclusive-content', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, emoji, title, description, url, buttonLabel })
      })
    } else {
      await fetch('/api/exclusive-content', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji, title, description, url, buttonLabel })
      })
    }
    resetForm()
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this exclusive content item?')) return
    await fetch('/api/exclusive-content', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    load()
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400" /> Exclusive Member Content
        </h1>
        <p className="text-white/40 text-sm">Add content here and it automatically appears on CreatorTV's homepage for Creator Pass &amp; VIP members only.</p>
      </div>

      {/* Add / Edit form */}
      <div className="rounded-2xl border border-yellow-500/20 p-5 mb-6" style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.06), #0e0e1c)' }}>
        <div className="text-white font-semibold text-sm mb-4">{editingId ? 'Edit Exclusive Item' : 'Add New Exclusive Content'}</div>

        <div className="mb-3">
          <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Icon</label>
          <div className="flex gap-1.5 flex-wrap">
            {EMOJI_OPTIONS.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all border ${emoji === e ? 'border-yellow-400 bg-yellow-400/15' : 'border-white/10 hover:border-white/25'}`}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Behind the Scenes: How I Film"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-yellow-400/40" />
        </div>

        <div className="mb-3">
          <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="A short description for your members"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-yellow-400/40" />
        </div>

        <div className="mb-3">
          <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Video / Content Link</label>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="YouTube link, TikTok link, or direct URL"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-yellow-400/40 mb-2" />
          <input ref={fileInputRef} type="file" accept="video/*,application/pdf,image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-all text-xs">
            {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</> : <><Upload className="w-3.5 h-3.5" /> Or upload a file instead</>}
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Button Label</label>
          <div className="flex gap-1.5">
            {['Watch ▶', 'Listen ▶', 'Download ↓', 'Read 📖'].map(l => (
              <button key={l} onClick={() => setButtonLabel(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${buttonLabel === l ? 'border-yellow-400 bg-yellow-400/15 text-yellow-300' : 'border-white/10 text-white/40 hover:text-white/70'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {editingId && (
            <button onClick={resetForm} className="px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white text-xs transition-all">
              <X className="w-3.5 h-3.5 inline mr-1" /> Cancel
            </button>
          )}
          <button onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-black transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
            {editingId ? <><Save className="w-3.5 h-3.5" /> Save Changes</> : <><Plus className="w-3.5 h-3.5" /> Add to Exclusive Content</>}
          </button>
        </div>
      </div>

      {/* Existing items */}
      <div className="text-white font-semibold text-sm mb-3">Live on CreatorTV ({items.length})</div>
      {loading ? (
        <div className="text-white/30 text-sm text-center py-8">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-white/30 text-sm text-center py-8 rounded-xl border border-white/8">No exclusive content yet — add your first item above!</div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl p-3 border border-white/8" style={{ background: '#0e0e1c' }}>
              <div className="text-2xl flex-shrink-0">{item.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold truncate">{item.title}</div>
                <div className="text-white/40 text-xs truncate">{item.description}</div>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-[10px] hover:underline flex items-center gap-1 mt-0.5 truncate">
                  {item.url} <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                </a>
              </div>
              <button onClick={() => startEdit(item)} className="w-8 h-8 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all flex-shrink-0">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/25 flex items-center justify-center text-red-400/60 hover:text-red-400 transition-all flex-shrink-0">
                <Trash className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
