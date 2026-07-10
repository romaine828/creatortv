"use client"

import { useState, useEffect } from "react"
import { Mail, Send, Users, Copy, Check } from "lucide-react"

interface Subscriber {
  id: string
  name: string
  email: string
  channelId: string
  plan: 'free' | 'creator' | 'vip'
}

export function NotifySubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('New on CreatorTV!')
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'creator' | 'vip'>('all')

  useEffect(() => {
    fetch('/api/subscribers').then(r => r.json()).then(data => {
      setSubscribers(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  const filtered = filterPlan === 'all' ? subscribers : subscribers.filter(s => s.plan === filterPlan)
  const uniqueEmails = Array.from(new Set(filtered.map(s => s.email)))

  const buildMailto = () => {
    // mailto with bcc works great for smaller lists (tens of recipients).
    // For big lists later, this is the natural place to plug in a real email service.
    const bcc = uniqueEmails.join(',')
    const subj = encodeURIComponent(subject)
    const body = encodeURIComponent(message)
    return `mailto:?bcc=${bcc}&subject=${subj}&body=${body}`
  }

  const copyEmails = () => {
    navigator.clipboard.writeText(uniqueEmails.join(', '))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="mb-4">
        <div className="text-white font-semibold text-sm flex items-center gap-1.5"><Mail className="w-4 h-4 text-blue-400" /> Notify My Subscribers</div>
        <p className="text-white/40 text-xs mt-1">Every time you post something new, let your subscribers know in one click. This uses your own email app — no extra service needed.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {(['all', 'free', 'creator', 'vip'] as const).map(p => (
          <button key={p} onClick={() => setFilterPlan(p)}
            className={`rounded-xl p-3 border text-center transition-all ${filterPlan === p ? 'border-blue-400/50 bg-blue-500/10' : 'border-white/8'}`}
            style={{ background: filterPlan === p ? undefined : '#0e0e1c' }}>
            <div className="text-white font-bold text-lg">{p === 'all' ? subscribers.length : subscribers.filter(s => s.plan === p).length}</div>
            <div className="text-white/30 text-[9px] uppercase tracking-wider">{p === 'all' ? 'All Subscribers' : p}</div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-white/30 text-sm text-center py-8">Loading subscribers...</div>
      ) : subscribers.length === 0 ? (
        <div className="text-white/30 text-sm text-center py-8 rounded-xl border border-white/8">
          No subscribers yet. As people subscribe to your channels, they'll show up here — ready to notify.
        </div>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-semibold text-sm flex items-center gap-1.5"><Users className="w-4 h-4 text-blue-400" /> Sending to {uniqueEmails.length} subscriber{uniqueEmails.length !== 1 ? 's' : ''}</div>
              <button onClick={copyEmails} className="text-[10px] text-blue-300 hover:text-blue-200 flex items-center gap-1">
                {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Emails</>}
              </button>
            </div>

            <div className="mb-3">
              <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-400/40" />
            </div>
            <div className="mb-4">
              <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Hey! Just dropped a new episode on CreatorTV — check it out here: [paste your link]"
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-blue-400/40 resize-y" />
            </div>

            <a href={buildMailto()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <Send className="w-4 h-4" /> Open in My Email App
            </a>
            <p className="text-white/25 text-[10px] text-center mt-2">This opens your default email app with everyone BCC'd — nothing is sent automatically.</p>
          </div>
        </>
      )}
    </div>
  )
}
