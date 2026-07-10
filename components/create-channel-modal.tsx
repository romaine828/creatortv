"use client"

import { useState } from "react"
import { Channel } from "@/lib/tv-data"
import { cn } from "@/lib/utils"
import { X, Plus, Trash, Play, Check, Tv, ChevronRight, AlertCircle, ExternalLink } from "lucide-react"

const EMOJI_OPTIONS = ['🎬', '🎵', '🎮', '🍕', '🌍', '💡', '🔥', '🚀', '🌟', '🎨', '📖', '🏋️', '🌿', '💻', '🎤', '🏆', '🦋', '🌈', '⚡', '🎯', '🛒', '🏠', '✝️', '🙏', '💰', '🐾', '🌺', '📸', '🎭', '🧠']
const COLOR_OPTIONS = [
  { label: 'Purple',  value: '#a855f7' },
  { label: 'Blue',    value: '#3b82f6' },
  { label: 'Cyan',    value: '#06b6d4' },
  { label: 'Green',   value: '#10b981' },
  { label: 'Lime',    value: '#84cc16' },
  { label: 'Amber',   value: '#f59e0b' },
  { label: 'Orange',  value: '#f97316' },
  { label: 'Red',     value: '#ef4444' },
  { label: 'Rose',    value: '#f43f5e' },
  { label: 'Pink',    value: '#ec4899' },
  { label: 'Indigo',  value: '#6366f1' },
  { label: 'Teal',    value: '#14b8a6' },
]

interface UserShow {
  title: string
  youtubeId: string
  description: string
  category: string
  host: string
  duration: string
}

interface CreateChannelModalProps {
  onClose: () => void
  onCreateChannel: (channel: Channel) => void
  existingCount: number
}

// Extract YouTube ID from any YouTube URL or plain ID
function extractYouTubeId(input: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) return match[1]
  }
  return input.trim()
}

export function CreateChannelModal({ onClose, onCreateChannel, existingCount }: CreateChannelModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [channelName, setChannelName] = useState('')
  const [tagline, setTagline] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('🎬')
  const [selectedColor, setSelectedColor] = useState('#a855f7')
  const [shows, setShows] = useState<UserShow[]>([
    { title: '', youtubeId: '', description: '', category: '', host: '', duration: '' }
  ])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [creating, setCreating] = useState(false)
  const [previewShow, setPreviewShow] = useState<string | null>(null)

  // UNLIMITED — no cap on shows
  const addShow = () => {
    setShows(prev => [...prev, { title: '', youtubeId: '', description: '', category: '', host: '', duration: '' }])
  }

  const removeShow = (i: number) => {
    if (shows.length > 1) setShows(prev => prev.filter((_, idx) => idx !== i))
  }

  const updateShow = (i: number, field: keyof UserShow, value: string) => {
    setShows(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!channelName.trim()) e.channelName = 'Channel name is required'
    if (channelName.trim().length < 3) e.channelName = 'Name must be at least 3 characters'
    if (!tagline.trim()) e.tagline = 'Add a short tagline for your channel'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e: Record<string, string> = {}
    const validShows = shows.filter(s => s.title.trim() && s.youtubeId.trim())
    if (validShows.length === 0) e.shows = 'Add at least 1 show with a title and YouTube video link'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = async () => {
    if (!validateStep2()) return
    setCreating(true)
    await new Promise(r => setTimeout(r, 1500))

    const validShows = shows.filter(s => s.title.trim() && s.youtubeId.trim())
    const newChannel: Channel = {
      id: `user-${Date.now()}`,
      number: existingCount + 1,
      name: channelName.trim(),
      tagline: tagline.trim(),
      color: selectedColor,
      bgGradient: 'from-gray-900/40 via-gray-800/20 to-transparent',
      textGradient: 'from-white to-gray-300',
      emoji: selectedEmoji,
      shows: validShows.map((s, i) => ({
        id: `user-show-${i}-${Date.now()}`,
        title: s.title.trim(),
        youtubeId: extractYouTubeId(s.youtubeId),
        description: s.description.trim() || `Watch ${s.title}`,
        category: s.category.trim() || 'General',
        host: s.host.trim() || channelName.trim(),
        duration: s.duration.trim() || 'Varies',
        airTime: i === 0 ? 'NOW LIVE' : undefined
      }))
    }

    setCreating(false)
    onCreateChannel(newChannel)
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
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${selectedColor}25` }}>
              <Tv className="w-4 h-4" style={{ color: selectedColor }} />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Create Your Channel</div>
              <div className="text-white/40 text-[10px]">Step {step} of 3 · Add as many videos as you want</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex-shrink-0 flex px-6 py-3 gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={cn("w-full h-1 rounded-full transition-all", step >= s ? 'opacity-100' : 'opacity-20')}
                style={{ background: step >= s ? selectedColor : '#ffffff30' }} />
              <span className="text-[9px] text-white/30">{['Channel Info', 'Add Videos', 'Preview'][s - 1]}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">Channel Name *</label>
                <input value={channelName} onChange={e => setChannelName(e.target.value)}
                  placeholder="e.g. Pastor Dave's Ministry Channel"
                  maxLength={40}
                  className={cn("w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 outline-none transition-all",
                    errors.channelName ? "border-red-500/50" : "border-white/10 focus:border-white/30")} />
                {errors.channelName && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.channelName}</p>}
              </div>

              <div>
                <label className="block text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">Tagline *</label>
                <input value={tagline} onChange={e => setTagline(e.target.value)}
                  placeholder="e.g. Faith, Hope & Inspiration Every Day"
                  maxLength={60}
                  className={cn("w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 outline-none transition-all",
                    errors.tagline ? "border-red-500/50" : "border-white/10 focus:border-white/30")} />
                {errors.tagline && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.tagline}</p>}
              </div>

              <div>
                <label className="block text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">Channel Emoji / Icon</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(e => (
                    <button key={e} onClick={() => setSelectedEmoji(e)}
                      className={cn("w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all border",
                        selectedEmoji === e ? "border-white/40 scale-110 bg-white/15" : "border-white/8 bg-white/5 hover:bg-white/10 hover:scale-105")}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">Channel Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button key={c.value} onClick={() => setSelectedColor(c.value)} title={c.label}
                      className={cn("w-8 h-8 rounded-full transition-all border-2", selectedColor === c.value ? "scale-110 border-white" : "border-transparent hover:scale-105")}
                      style={{ background: c.value }} />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl p-4 border border-white/8"
                style={{ background: `linear-gradient(135deg, ${selectedColor}15, #0c0c18)` }}>
                <div className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-2">Channel Preview</div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${selectedColor}25` }}>{selectedEmoji}</div>
                  <div>
                    <div className="text-white font-bold">{channelName || 'My Channel'}</div>
                    <div className="text-white/50 text-xs">{tagline || 'Your channel tagline'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2 — Add Videos ── */}
          {step === 2 && (
            <div className="space-y-4">

              {/* CLEAR YouTube ID instructions */}
              <div className="rounded-xl border border-blue-500/20 overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(59,130,246,0.1)' }}>
                  <span className="text-blue-400 text-sm">📺</span>
                  <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">How to Add a YouTube Video</span>
                </div>
                <div className="px-4 py-3 space-y-3" style={{ background: 'rgba(59,130,246,0.05)' }}>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-500/30 text-blue-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <p className="text-white/70 text-xs leading-relaxed">Open YouTube and find the video you want on your channel</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-500/30 text-blue-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <div className="flex-1">
                      <p className="text-white/70 text-xs leading-relaxed mb-1.5">Look at the address bar at the top — it looks like this:</p>
                      <div className="rounded-lg px-3 py-2 font-mono text-xs" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <span className="text-white/30">youtube.com/watch?v=</span>
                        <span className="text-yellow-400 font-bold">dQw4w9WgXcQ</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-500/30 text-blue-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <p className="text-white/70 text-xs leading-relaxed">
                      Copy the whole link from your browser and <strong className="text-white">paste it directly</strong> into the box below — we'll handle the rest automatically!
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-white/8">
                    <Check className="w-3 h-3 text-green-400" />
                    <p className="text-green-300/80 text-[10px]">Works with regular YouTube links, YouTube Shorts, and youtu.be short links</p>
                  </div>
                </div>
              </div>

              {/* No limit notice */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <span className="text-green-300 text-xs"><strong>No limit</strong> — add as many videos as you want to your channel!</span>
              </div>

              {errors.shows && (
                <p className="text-red-400 text-xs flex items-center gap-1 bg-red-500/10 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-3 h-3" />{errors.shows}
                </p>
              )}

              {shows.map((show, i) => (
                <div key={i} className="rounded-xl border border-white/8 overflow-hidden" style={{ background: '#12121e' }}>
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5"
                    style={{ background: `${selectedColor}12` }}>
                    <span className="text-white/60 text-xs font-semibold flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: selectedColor }}>{i + 1}</span>
                      Video #{i + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {show.youtubeId && (
                        <button onClick={() => setPreviewShow(previewShow === show.youtubeId ? null : show.youtubeId)}
                          className="text-[10px] text-white/50 hover:text-white/80 flex items-center gap-1 transition-colors">
                          <Play className="w-3 h-3" /> Preview
                        </button>
                      )}
                      {shows.length > 1 && (
                        <button onClick={() => removeShow(i)} className="text-red-400/60 hover:text-red-400 transition-colors p-1">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {previewShow === show.youtubeId && show.youtubeId && (
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(show.youtubeId)}?rel=0&modestbranding=1`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen />
                    </div>
                  )}

                  <div className="p-4 grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">
                        Video Title *
                      </label>
                      <input value={show.title} onChange={e => updateShow(i, 'title', e.target.value)}
                        placeholder="e.g. How to Start Your Morning Right"
                        className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-white/25 transition-all" />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">
                        YouTube Link or Video ID *
                        <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"
                          className="ml-2 normal-case text-blue-400 hover:text-blue-300 inline-flex items-center gap-0.5">
                          Open YouTube <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </label>
                      <input value={show.youtubeId} onChange={e => updateShow(i, 'youtubeId', e.target.value)}
                        placeholder="Paste full YouTube link here — e.g. https://www.youtube.com/watch?v=..."
                        className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-white/25 transition-all" />
                      {show.youtubeId && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-green-400" />
                          <span className="text-green-400 text-[10px]">
                            Video ID detected: <code className="font-mono text-yellow-400">{extractYouTubeId(show.youtubeId)}</code>
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Category</label>
                      <input value={show.category} onChange={e => updateShow(i, 'category', e.target.value)}
                        placeholder="e.g. Teaching, Worship, Q&A"
                        className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-white/25 transition-all" />
                    </div>
                    <div>
                      <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Your Name / Host</label>
                      <input value={show.host} onChange={e => updateShow(i, 'host', e.target.value)}
                        placeholder="e.g. Pastor Dave"
                        className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-white/25 transition-all" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Short Description (optional)</label>
                      <textarea value={show.description} onChange={e => updateShow(i, 'description', e.target.value)}
                        placeholder="What is this video about? What will viewers learn or experience?"
                        rows={2}
                        className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-white/25 transition-all resize-none" />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add more — UNLIMITED */}
              <button onClick={addShow}
                className="w-full py-3.5 rounded-xl border border-dashed border-white/15 text-white/40 hover:text-white/70 hover:border-white/30 transition-all flex items-center justify-center gap-2 text-sm font-semibold">
                <Plus className="w-4 h-4" /> Add Another Video
                <span className="text-[10px] text-white/20 font-normal">(unlimited)</span>
              </button>
            </div>
          )}

          {/* ── STEP 3 — Preview ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl p-5 border"
                style={{ background: `linear-gradient(135deg, ${selectedColor}20, #0c0c18)`, borderColor: `${selectedColor}30` }}>
                <div className="text-3xl mb-2">{selectedEmoji}</div>
                <div className="text-xl font-black text-white mb-0.5">{channelName}</div>
                <div className="text-white/50 text-sm mb-3">{tagline}</div>
                <div className="flex items-center gap-3 text-xs text-white/40">
                  <span className="flex items-center gap-1"><Play className="w-3 h-3" />{shows.filter(s => s.title && s.youtubeId).length} videos</span>
                  <span className="flex items-center gap-1 text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" />Going LIVE</span>
                </div>
              </div>

              <div>
                <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Your Videos ({shows.filter(s => s.title && s.youtubeId).length})</div>
                <div className="space-y-2">
                  {shows.filter(s => s.title && s.youtubeId).map((s, i) => {
                    const vid = extractYouTubeId(s.youtubeId)
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/4">
                        <div className="w-14 aspect-video rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                          <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt={s.title}
                            className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-white text-sm font-semibold truncate">{s.title}</div>
                          <div className="text-white/40 text-xs">{s.category || 'General'} · {s.host || channelName}</div>
                          <div className="text-white/25 text-[10px] font-mono mt-0.5">ID: {vid}</div>
                        </div>
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: selectedColor }} />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm text-green-300 leading-relaxed">
                🎉 Your channel is ready! Click <strong>"Create Channel"</strong> below and it will instantly appear in the sidebar and channel grid for everyone to watch.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-white/5">
          <button
            onClick={step === 1 ? onClose : () => setStep(s => (s - 1) as 1 | 2 | 3)}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-all text-sm">
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          <div className="flex items-center gap-3">
            <span className="text-white/25 text-xs">{step === 2 ? `${shows.filter(s => s.title && s.youtubeId).length} video${shows.filter(s => s.title && s.youtubeId).length !== 1 ? 's' : ''} added` : ''}</span>
            <button
              onClick={() => {
                if (step === 1) { if (validateStep1()) setStep(2) }
                else if (step === 2) { if (validateStep2()) setStep(3) }
                else handleCreate()
              }}
              disabled={creating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${selectedColor}, #ec4899)`, boxShadow: `0 0 25px ${selectedColor}40` }}>
              {creating ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating...</>
              ) : step === 3 ? (
                <><Tv className="w-4 h-4" /> Create My Channel</>
              ) : (
                <>Next Step <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
