"use client"

import { useState, useEffect } from "react"
import { Tv, Send, Loader2, ChevronDown, ChevronUp, Search, MessageSquare, ArrowLeft } from "lucide-react"

interface QAItem {
  id: string; question: string; name: string; timestamp: string
  answer?: string; answeredAt?: string; featured: boolean; category: string
}

const CATEGORIES = [
  { value: 'general', label: 'General', emoji: '💬' },
  { value: 'channels', label: 'Channels', emoji: '📺' },
  { value: 'content', label: 'Content Request', emoji: '💡' },
  { value: 'tech', label: 'Technical', emoji: '🔧' },
  { value: 'feedback', label: 'Feedback', emoji: '⭐' },
]

function timeAgo(ts: string) {
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000)
  if (d === 0) return 'Today'; if (d === 1) return 'Yesterday'
  if (d < 7) return `${d} days ago`; return new Date(ts).toLocaleDateString()
}

export default function FeedbackPage() {
  const [items, setItems] = useState<QAItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [question, setQuestion] = useState('')
  const [category, setCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetch('/api/qa').then(r => r.json()).then(q => {
      setItems(Array.isArray(q) ? q.filter((x: QAItem) => x.answer || x.featured) : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!name.trim() || !question.trim()) { setError('Please provide your name and question.'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/qa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), question: question.trim(), category }) })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error'); return }
      setSubmitted(true); setName(''); setQuestion(''); setCategory('general'); setShowForm(false)
    } catch { setError('Network error.') } finally { setSubmitting(false) }
  }

  const filtered = items.filter(i => {
    const matchCat = filterCat === 'all' || i.category === filterCat
    const matchSearch = !search || i.question.toLowerCase().includes(search.toLowerCase()) || i.answer?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#07070f' }}><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>

  return (
    <div className="min-h-screen" style={{ background: '#07070f' }}>
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between" style={{ background: '#07070f' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-black text-sm">CreatorTV</div>
            <div className="text-white/30 text-[10px]">Q&A · Feedback</div>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <a href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-pink-400 border border-pink-500/30 hover:bg-pink-500/10 transition-all">
            <ArrowLeft className="w-3 h-3" /> Back to CreatorTV
          </a>
          {[{ label: '💬 Community', href: '/community' }].map(link => (
            <a key={link.href} href={link.href} className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-white/40 hover:text-white border border-white/5 hover:border-white/15 transition-all">{link.label}</a>
          ))}
        </nav>
      </header>

      <div className="text-center py-14 px-6" style={{ background: 'linear-gradient(180deg, rgba(236,72,153,0.08) 0%, transparent 100%)' }}>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-white text-3xl font-black mb-3">Ask Me Anything</h1>
        <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
          Questions about channels, content, or anything else? I read every question and answer the best ones here!
        </p>
        <button onClick={() => setShowForm(!showForm)}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
          <MessageSquare className="w-4 h-4" /> {showForm ? 'Hide Form' : 'Ask a Question'}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-16 space-y-8">
        {submitted && (
          <div className="rounded-2xl border border-green-500/20 p-6 text-center" style={{ background: 'rgba(34,197,94,0.06)' }}>
            <div className="text-4xl mb-3">🙏</div>
            <h3 className="text-white font-black mb-1">Question Received!</h3>
            <p className="text-white/50 text-sm">Thank you! I'll answer featured questions right here on the Q&A page.</p>
            <button onClick={() => setSubmitted(false)} className="mt-4 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 text-white/50 hover:text-white transition-all">Ask Another</button>
          </div>
        )}

        {showForm && !submitted && (
          <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: '#0e0e1c' }}>
            <div className="px-6 py-4 border-b border-white/5" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.08), transparent)' }}>
              <h2 className="text-white font-black text-base">❓ Submit Your Question</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/40 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Your Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="First name"
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="block text-white/40 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-white/40 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Question * ({question.length}/600)</label>
                <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={4} maxLength={600}
                  placeholder="Ask anything about CreatorTV, channels, content, or anything else…"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 resize-none" />
              </div>
              {error && <p className="text-red-400 text-xs">⚠️ {error}</p>}
              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-60 hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Submitting…' : 'Submit Question'}
              </button>
            </form>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions…"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFilterCat('all')} className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={filterCat === 'all' ? { background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                All Topics
              </button>
              {CATEGORIES.map(c => (
                <button key={c.value} onClick={() => setFilterCat(c.value)} className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={filterCat === c.value ? { background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4">💬 Answered Questions ({filtered.length})</h3>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/5 py-14 text-center" style={{ background: '#0e0e1c' }}>
              <div className="text-5xl mb-4">🤔</div>
              <p className="text-white/40 text-sm">{search ? 'No matching questions.' : 'No answered questions yet.'}</p>
              {!search && <button onClick={() => setShowForm(true)} className="mt-5 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>Ask the First Question</button>}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(item => (
                <div key={item.id} className="rounded-2xl border overflow-hidden" style={{ background: '#0e0e1c', borderColor: item.featured ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.06)' }}>
                  <button onClick={() => setOpenId(openId === item.id ? null : item.id)} className="w-full text-left p-5 flex items-start gap-3 hover:bg-white/3 transition-all">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 mt-0.5" style={{ background: 'rgba(236,72,153,0.12)' }}>
                      {CATEGORIES.find(c => c.value === item.category)?.emoji || '❓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-white/50 text-[10px]">{item.name} asked · {timeAgo(item.timestamp)}</span>
                        {item.answer && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>✓ Answered</span>}
                        {item.featured && <span className="text-yellow-400 text-[10px] font-bold">⭐ Featured</span>}
                      </div>
                      <p className="text-white/80 text-sm font-semibold">{item.question}</p>
                    </div>
                    <div className="text-white/30 mt-1 flex-shrink-0">{openId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
                  </button>
                  {openId === item.id && item.answer && (
                    <div className="px-5 pb-5">
                      <div className="rounded-xl p-4 border-l-2" style={{ background: 'rgba(168,85,247,0.08)', borderColor: '#a855f7' }}>
                        <div className="flex items-center gap-2 mb-2"><Tv className="w-3.5 h-3.5 text-purple-400" /><span className="text-purple-400 text-[10px] font-bold uppercase tracking-wider">Creator Answer</span></div>
                        <p className="text-white/75 text-sm leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/5 p-5 text-center" style={{ background: '#0e0e1c' }}>
          <p className="text-white/40 text-sm mb-3">Want to connect with other viewers?</p>
          <a href="/community" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>📺 Viewer Community Wall</a>
        </div>
      </div>
    </div>
  )
}
