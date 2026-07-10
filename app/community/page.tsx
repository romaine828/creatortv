"use client"

import { useState, useEffect } from "react"
import { Tv, Send, Loader2, Pin, MessageCircle, ArrowRight, ArrowLeft } from "lucide-react"

interface CommunityPost {
  id: string; name: string; message: string; emoji: string
  timestamp: string; approved: boolean; pinned: boolean; reply?: string
}

const EMOJIS = ['🙌', '❤️', '🎉', '🔥', '✨', '🙏', '👏', '💙', '📺', '🎬', '😊', '🌟']

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(ts).toLocaleDateString()
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [emoji, setEmoji] = useState('🙌')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/community').then(r => r.json()).then(p => {
      setPosts(Array.isArray(p) ? p.filter((x: CommunityPost) => x.approved || x.pinned) : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!name.trim() || !message.trim()) { setError('Please fill in your name and message.'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/community', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), message: message.trim(), emoji }) })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error'); return }
      setSubmitted(true); setName(''); setMessage(''); setEmoji('🙌')
    } catch { setError('Network error.') } finally { setSubmitting(false) }
  }

  const pinnedPosts = posts.filter(p => p.pinned)
  const regularPosts = posts.filter(p => !p.pinned)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#07070f' }}>
      <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#07070f' }}>
      <header className="border-b border-white/5 px-4 py-3 flex items-center justify-between" style={{ background: '#07070f' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-black text-sm">CreatorTV</div>
            <div className="text-white/30 text-[10px]">Viewer Community</div>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <a href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-purple-400 border border-purple-500/30 hover:bg-purple-500/10 transition-all">
            <ArrowLeft className="w-3 h-3" /> Back to CreatorTV
          </a>
          <a href="/feedback" className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-white/40 hover:text-white border border-white/5 hover:border-white/15 transition-all">❓ Q&A</a>
        </nav>
      </header>

      <div className="text-center py-14 px-6" style={{ background: 'linear-gradient(180deg, rgba(168,85,247,0.10) 0%, transparent 100%)' }}>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-white text-3xl font-black mb-3">Viewer Community Wall</h1>
        <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
          Share what you love about CreatorTV, leave a shoutout, or say hello to the community! 📺
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-16 space-y-8">
        {!submitted ? (
          <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: '#0e0e1c' }}>
            <div className="px-6 py-4 border-b border-white/5" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1), transparent)' }}>
              <h2 className="text-white font-black text-base">✍️ Leave a Message</h2>
              <p className="text-white/30 text-xs mt-1">Messages appear after review. Keep it positive and encouraging!</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-white/40 text-[10px] font-bold mb-2 uppercase tracking-wider">Your Vibe</label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJIS.map(e => (
                    <button key={e} type="button" onClick={() => setEmoji(e)}
                      className="text-xl p-2 rounded-xl transition-all"
                      style={{ background: emoji === e ? 'rgba(168,85,247,0.35)' : 'rgba(255,255,255,0.05)', transform: emoji === e ? 'scale(1.25)' : 'scale(1)' }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-white/40 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Your Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="First name or nickname" maxLength={50}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50" />
              </div>
              <div>
                <label className="block text-white/40 text-[10px] font-bold mb-1.5 uppercase tracking-wider">
                  Message * <span className="text-white/20 normal-case font-normal">({message.length}/500)</span>
                </label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} maxLength={500}
                  placeholder="Share what CreatorTV means to you, suggest a channel or topic, or just say hello…"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 resize-none" />
              </div>
              {error && <p className="text-red-400 text-xs">⚠️ {error}</p>}
              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-60 hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Sending…' : 'Post to the Wall'}
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl border border-green-500/20 p-8 text-center" style={{ background: 'rgba(34,197,94,0.06)' }}>
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-white text-xl font-black mb-2">Message Submitted!</h3>
            <p className="text-white/50 text-sm">Your message will appear after review. Thank you for being part of CreatorTV!</p>
            <button onClick={() => setSubmitted(false)} className="mt-5 px-5 py-2 rounded-xl text-sm font-bold border border-white/10 text-white/50 hover:text-white transition-all">Post Another</button>
          </div>
        )}

        {pinnedPosts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4"><Pin className="w-4 h-4 text-yellow-400" /><h3 className="text-white/50 text-xs font-bold uppercase tracking-wider">Pinned</h3></div>
            <div className="space-y-3">{pinnedPosts.map(p => <PostCard key={p.id} post={p} pinned />)}</div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider">Community Wall {regularPosts.length > 0 && `· ${regularPosts.length}`}</h3>
            <a href="/feedback" className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">Ask a Question <ArrowRight className="w-3 h-3" /></a>
          </div>
          {regularPosts.length === 0 ? (
            <div className="rounded-2xl border border-white/5 py-14 text-center" style={{ background: '#0e0e1c' }}>
              <div className="text-5xl mb-4">📺</div>
              <p className="text-white/40 text-sm">No messages yet — be the first!</p>
            </div>
          ) : (
            <div className="space-y-3">{regularPosts.map(p => <PostCard key={p.id} post={p} />)}</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '📺', label: '← Back to CreatorTV', desc: 'Return to the main TV', href: '/' },
            { icon: '🛍️', label: 'Merch Store', desc: 'Get official gear', href: '/store' },
            { icon: '❓', label: 'Ask a Question', desc: 'Q&A with the creator', href: '/feedback' },
          ].map(item => (
            <a key={item.href} href={item.href}
              className="flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:border-white/15 transition-all group" style={{ background: '#0e0e1c' }}>
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="text-white/70 text-sm font-bold group-hover:text-white transition-colors">{item.label}</div>
                <div className="text-white/30 text-[11px]">{item.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function PostCard({ post, pinned = false }: { post: CommunityPost; pinned?: boolean }) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: '#0e0e1c', borderColor: pinned ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.05)' }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(168,85,247,0.15)' }}>{post.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-white font-bold text-sm">{post.name}</span>
            {pinned && <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(234,179,8,0.15)', color: '#fbbf24' }}><Pin className="w-2.5 h-2.5" /> Pinned</span>}
            <span className="text-white/25 text-[10px] ml-auto">{timeAgo(post.timestamp)}</span>
          </div>
          <p className="text-white/65 text-sm leading-relaxed">{post.message}</p>
          {post.reply && (
            <div className="mt-3 pl-3 border-l-2 p-3 rounded-r-xl" style={{ borderColor: '#a855f7', background: 'rgba(168,85,247,0.08)' }}>
              <div className="text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Tv className="w-3 h-3" /> Creator Reply</div>
              <p className="text-white/70 text-xs leading-relaxed">{post.reply}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
