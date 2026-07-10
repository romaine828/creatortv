"use client"

import { useState, useRef } from "react"
import { Channel, Show } from "@/lib/tv-data"
import { cn } from "@/lib/utils"
import { X, Trash, Plus, Check, Edit2, Save, Play, AlertCircle, ExternalLink, Upload, Loader2, Lock, Radio } from "lucide-react"

function extractYouTubeId(input: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const p of patterns) {
    const m = input.match(p)
    if (m) return m[1]
  }
  return input.trim()
}

type VideoSource = 'youtube' | 'tiktok' | 'upload' | 'direct'

interface EditChannelModalProps {
  channel: Channel
  onSave: (updated: Channel) => void
  onClose: () => void
}

export function EditChannelModal({ channel, onSave, onClose }: EditChannelModalProps) {
  const [shows, setShows] = useState<Show[]>(channel.shows.map(s => ({ ...s })))
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Editable fields for the currently editing show
  const [source, setSource] = useState<VideoSource>('youtube')
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')       // youtube link/id
  const [editVideoUrl, setEditVideoUrl] = useState('')  // tiktok/direct/upload url
  const [editDesc, setEditDesc] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editHost, setEditHost] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editExclusive, setEditExclusive] = useState(false)
  const [editLive, setEditLive] = useState(false)

  const startEdit = (i: number) => {
    const s = shows[i]
    setSource((s.videoType as VideoSource) || 'youtube')
    setEditTitle(s.title)
    setEditUrl(s.youtubeId || '')
    setEditVideoUrl(s.videoUrl || '')
    setEditDesc(s.description)
    setEditCategory(s.category)
    setEditHost(s.host || '')
    setEditDuration(s.duration)
    setEditExclusive(!!s.exclusive)
    setEditLive(!!s.isLive)
    setEditingIndex(i)
    setPreviewId(null)
  }

  const saveEdit = (i: number) => {
    setShows(prev => prev.map((s, idx) => idx === i ? {
      ...s,
      title: editTitle.trim() || s.title,
      videoType: source,
      youtubeId: source === 'youtube' ? extractYouTubeId(editUrl) : s.youtubeId,
      videoUrl: source !== 'youtube' ? editVideoUrl.trim() : undefined,
      description: editDesc.trim() || s.description,
      category: editCategory.trim() || s.category,
      host: editHost.trim() || s.host,
      duration: editDuration.trim() || s.duration,
      exclusive: editExclusive,
      isLive: editLive,
      airTime: editLive ? 'NOW LIVE' : (s.airTime === 'NOW LIVE' ? undefined : s.airTime),
    } : s))
    setEditingIndex(null)
  }

  const removeShow = (i: number) => {
    setShows(prev => prev.filter((_, idx) => idx !== i))
    if (editingIndex === i) setEditingIndex(null)
  }

  const addBlankShow = () => {
    const blank: Show = {
      id: `new-${Date.now()}`,
      title: 'New Video',
      youtubeId: '',
      description: 'Add your description here',
      category: 'General',
      host: channel.name,
      duration: 'Varies',
      airTime: undefined,
      videoType: 'youtube',
    }
    setShows(prev => [...prev, blank])
    setTimeout(() => startEdit(shows.length), 50)
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setEditVideoUrl(data.url)
      } else {
        alert('Upload failed: ' + (data.error || 'unknown error'))
      }
    } catch (err) {
      alert('Upload failed. The file may be too large.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    const updated: Channel = { ...channel, shows }
    setSaved(true)
    await new Promise(r => setTimeout(r, 800))
    onSave(updated)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        style={{ background: '#0e0e1c', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/5"
          style={{ background: `linear-gradient(135deg, ${channel.color}15, transparent)` }}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">{channel.emoji}</div>
            <div>
              <div className="text-white font-bold text-sm">Edit Channel: {channel.name}</div>
              <div className="text-white/40 text-[10px]">{shows.length} video{shows.length !== 1 ? 's' : ''} · YouTube, TikTok, uploads, or direct links</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions */}
        <div className="flex-shrink-0 mx-6 mt-4 rounded-xl px-4 py-3 text-xs text-white/60 leading-relaxed border border-white/5"
          style={{ background: '#12121e' }}>
          <strong className="text-white/80">How to add a video:</strong> Click ✏️ on any row, choose YouTube, TikTok, Upload File, or Direct Link, then paste or upload. Mark ⭐ Exclusive to make it members-only, or 🔴 Live for a live broadcast.
        </div>

        {/* Video list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {shows.length === 0 && (
            <div className="text-center py-10 text-white/30 text-sm">
              No videos yet. Click "Add New Video" below to get started.
            </div>
          )}

          {shows.map((show, i) => {
            const isEditing = editingIndex === i
            const vid = extractYouTubeId(show.youtubeId || '')
            const showType = show.videoType || 'youtube'
            return (
              <div key={show.id || i}
                className={cn("rounded-xl border overflow-hidden transition-all",
                  isEditing ? "border-opacity-50 ring-1" : "border-white/8")}
                style={isEditing ? { borderColor: channel.color, '--tw-ring-color': channel.color } as any : {}}>

                {/* Row header */}
                <div className="flex items-center gap-3 px-4 py-3"
                  style={{ background: isEditing ? `${channel.color}12` : '#181828' }}>
                  {/* Thumbnail */}
                  <div className="w-16 aspect-video rounded-lg overflow-hidden bg-black/50 flex-shrink-0 relative">
                    {showType === 'youtube' && vid ? (
                      <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt={show.title}
                        className="w-full h-full object-cover" />
                    ) : show.thumbnailUrl ? (
                      <img src={show.thumbnailUrl} alt={show.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <Play className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <div className="text-white text-sm font-semibold truncate">{show.title}</div>
                      {show.exclusive && <Lock className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                      {show.isLive && <Radio className="w-3 h-3 text-red-400 flex-shrink-0" />}
                    </div>
                    <div className="text-white/35 text-[10px] mt-0.5 truncate">
                      {show.category} · {show.host || channel.name} · <span className="uppercase">{showType}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {showType === 'youtube' && vid && (
                      <button onClick={() => setPreviewId(previewId === vid ? null : vid)}
                        className="w-7 h-7 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all"
                        title="Preview video">
                        <Play className="w-3 h-3" />
                      </button>
                    )}
                    <button onClick={() => isEditing ? setEditingIndex(null) : startEdit(i)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all text-white/50 hover:text-white"
                      style={isEditing ? { background: `${channel.color}30`, color: channel.color } : { background: 'rgba(255,255,255,0.08)' }}
                      title="Edit video">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeShow(i)}
                      className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/25 flex items-center justify-center text-red-400/60 hover:text-red-400 transition-all"
                      title="Remove this video">
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Preview */}
                {previewId === vid && vid && showType === 'youtube' && (
                  <div className="aspect-video border-t border-white/5">
                    <iframe src={`https://www.youtube-nocookie.com/embed/${vid}?rel=0&modestbranding=1`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen />
                  </div>
                )}

                {/* Edit form */}
                {isEditing && (
                  <div className="p-4 border-t border-white/5 space-y-3">

                    {/* Video source selector */}
                    <div>
                      <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Video Source</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'youtube', label: 'YouTube' },
                          { id: 'tiktok', label: 'TikTok' },
                          { id: 'upload', label: 'Upload File' },
                          { id: 'direct', label: 'Direct Link' },
                        ].map(opt => (
                          <button key={opt.id} type="button" onClick={() => setSource(opt.id as VideoSource)}
                            className={cn("py-2 rounded-lg text-[10px] font-bold transition-all border",
                              source === opt.id ? "text-white border-transparent" : "text-white/40 border-white/10 hover:text-white/70")}
                            style={source === opt.id ? { background: channel.color } : {}}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* YouTube input */}
                    {source === 'youtube' && (
                      <div>
                        <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider flex items-center gap-2">
                          YouTube Link or Video ID
                          <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 normal-case flex items-center gap-0.5 font-normal">
                            Open YouTube <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </label>
                        <input value={editUrl} onChange={e => setEditUrl(e.target.value)}
                          placeholder="Paste full YouTube URL or just the video ID"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-white/30 transition-all" />
                        {editUrl && (
                          <p className="text-green-400 text-[10px] mt-1 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Detected ID: <code className="font-mono text-yellow-400">{extractYouTubeId(editUrl)}</code>
                          </p>
                        )}
                      </div>
                    )}

                    {/* TikTok input */}
                    {source === 'tiktok' && (
                      <div>
                        <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">TikTok Video Link</label>
                        <input value={editVideoUrl} onChange={e => setEditVideoUrl(e.target.value)}
                          placeholder="https://www.tiktok.com/@you/video/123456789"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-white/30 transition-all" />
                        <p className="text-white/30 text-[10px] mt-1">Paste the full link to your TikTok post — it'll embed right on your channel.</p>
                      </div>
                    )}

                    {/* Upload file input */}
                    {source === 'upload' && (
                      <div>
                        <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Upload Video File</label>
                        <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-all text-sm">
                          {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Choose video file from your computer</>}
                        </button>
                        {editVideoUrl && !uploading && (
                          <p className="text-green-400 text-[10px] mt-1 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Uploaded: <code className="font-mono text-yellow-400">{editVideoUrl}</code>
                          </p>
                        )}
                        <p className="text-white/30 text-[10px] mt-1">Best for shorter videos — very large files may take a while.</p>
                      </div>
                    )}

                    {/* Direct link input */}
                    {source === 'direct' && (
                      <div>
                        <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Direct Video URL</label>
                        <input value={editVideoUrl} onChange={e => setEditVideoUrl(e.target.value)}
                          placeholder="https://your-storage.com/video.mp4"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-white/30 transition-all" />
                        <p className="text-white/30 text-[10px] mt-1">Works with Google Drive (shared link), Dropbox, or any hosted .mp4 file.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Category</label>
                        <input value={editCategory} onChange={e => setEditCategory(e.target.value)}
                          placeholder="e.g. Tutorial"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-white/30 transition-all" />
                      </div>
                      <div>
                        <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Host / Creator</label>
                        <input value={editHost} onChange={e => setEditHost(e.target.value)}
                          placeholder="Your name"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-white/30 transition-all" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Description</label>
                      <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)}
                        placeholder="What is this video about?"
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-white/30 transition-all resize-none" />
                    </div>

                    {/* Exclusive + Live toggles */}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editExclusive} onChange={e => setEditExclusive(e.target.checked)}
                          className="w-4 h-4 rounded accent-yellow-500" />
                        <span className="text-white/60 text-xs flex items-center gap-1"><Lock className="w-3 h-3 text-yellow-400" /> Exclusive (members only)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editLive} onChange={e => setEditLive(e.target.checked)}
                          className="w-4 h-4 rounded accent-red-500" />
                        <span className="text-white/60 text-xs flex items-center gap-1"><Radio className="w-3 h-3 text-red-400" /> Mark as LIVE now</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingIndex(null)}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white text-xs transition-all">Cancel</button>
                      <button onClick={() => saveEdit(i)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-semibold transition-all hover:opacity-90"
                        style={{ background: channel.color }}>
                        <Save className="w-3 h-3" /> Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Add new video */}
          <button onClick={addBlankShow}
            className="w-full py-3.5 rounded-xl border border-dashed border-white/15 text-white/40 hover:text-white/70 hover:border-white/30 transition-all flex items-center justify-center gap-2 text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add New Video
          </button>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-white/5">
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white transition-all text-sm">
            Cancel
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : `linear-gradient(135deg, ${channel.color}, #ec4899)` }}>
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Channel ({shows.length} videos)</>}
          </button>
        </div>
      </div>
    </div>
  )
}
