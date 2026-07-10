"use client"

import { useState, useEffect } from "react"
import { Link2, Save, Check, ListChecks, ExternalLink } from "lucide-react"
import { NotifySubscribers } from "@/components/notify-subscribers"

interface SiteLinks {
  podcastUrl: string
  scriptureCardsUrl: string
  customLink1Label: string
  customLink1Url: string
}

const DISTRIBUTION_PLATFORMS = [
  { id: 'youtube', label: 'YouTube', desc: 'Your main channel — already live!' },
  { id: 'roku', label: 'Roku Direct Publisher', desc: 'Submit your MRSS feed for Roku smart TVs' },
  { id: 'firetv', label: 'Amazon Fire TV', desc: 'Submit as a Fire TV web app' },
  { id: 'tiktok', label: 'TikTok', desc: 'Post short clips linking back to full episodes' },
  { id: 'instagram', label: 'Instagram / Reels', desc: 'Cross-post clips and behind-the-scenes' },
  { id: 'facebook', label: 'Facebook Page', desc: 'Share episodes to your community there' },
]

export function GrowthManager() {
  const [links, setLinks] = useState<SiteLinks>({ podcastUrl: '', scriptureCardsUrl: '', customLink1Label: '', customLink1Url: '' })
  const [saved, setSaved] = useState(false)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/site-links').then(r => r.json()).then(setLinks).catch(() => {})
    const stored = localStorage.getItem('creatortv_distribution_checklist')
    if (stored) setChecklist(JSON.parse(stored))
  }, [])

  const saveLinks = async () => {
    await fetch('/api/site-links', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(links)
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleCheck = (id: string) => {
    const updated = { ...checklist, [id]: !checklist[id] }
    setChecklist(updated)
    localStorage.setItem('creatortv_distribution_checklist', JSON.stringify(updated))
  }

  const doneCount = Object.values(checklist).filter(Boolean).length

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Link2 className="w-6 h-6 text-cyan-400" /> Growth &amp; Cross-Promotion
        </h1>
        <p className="text-white/40 text-sm">Set these up once — they'll keep working automatically every time someone visits CreatorTV or your podcast.</p>
      </div>

      {/* Site links */}
      <div className="rounded-2xl border border-cyan-500/20 p-5 mb-6" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.06), #0e0e1c)' }}>
        <div className="text-white font-semibold text-sm mb-1">Cross-Promotion Links</div>
        <div className="text-white/40 text-xs mb-4">These automatically appear as a "More From Us" banner on your CreatorTV homepage — helping every visitor discover the rest of what you do.</div>

        <div className="mb-3">
          <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Podcast URL (The Romaine Oda Show)</label>
          <input value={links.podcastUrl} onChange={e => setLinks({ ...links, podcastUrl: e.target.value })}
            placeholder="https://your-podcast-domain.com"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-cyan-400/40" />
        </div>
        <div className="mb-3">
          <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Scripture Cards Shop URL</label>
          <input value={links.scriptureCardsUrl} onChange={e => setLinks({ ...links, scriptureCardsUrl: e.target.value })}
            placeholder="https://payhip.com/your-store"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-cyan-400/40" />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Custom Link Label</label>
            <input value={links.customLink1Label} onChange={e => setLinks({ ...links, customLink1Label: e.target.value })}
              placeholder="e.g. Follow on Instagram"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-cyan-400/40" />
          </div>
          <div>
            <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Custom Link URL</label>
            <input value={links.customLink1Url} onChange={e => setLinks({ ...links, customLink1Url: e.target.value })}
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none focus:border-cyan-400/40" />
          </div>
        </div>

        <button onClick={saveLinks}
          className="px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 flex items-center gap-1.5"
          style={{ background: saved ? '#10b981' : 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
          {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Save Links</>}
        </button>
      </div>

      {/* Notify subscribers */}
      <div className="rounded-2xl border border-blue-500/20 p-5 mb-6" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), #0e0e1c)' }}>
        <NotifySubscribers />
      </div>

      {/* Distribution checklist */}
      <div className="rounded-2xl border border-white/8 p-5" style={{ background: '#0e0e1c' }}>
        <div className="flex items-center justify-between mb-1">
          <div className="text-white font-semibold text-sm flex items-center gap-1.5"><ListChecks className="w-4 h-4 text-purple-400" /> Distribution Checklist</div>
          <span className="text-white/30 text-xs">{doneCount}/{DISTRIBUTION_PLATFORMS.length} done</span>
        </div>
        <div className="text-white/40 text-xs mb-4">Make sure you're live everywhere your audience already is. Check these off as you complete them.</div>

        <div className="flex flex-col gap-2">
          {DISTRIBUTION_PLATFORMS.map(p => (
            <label key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/3 transition-all cursor-pointer">
              <input type="checkbox" checked={!!checklist[p.id]} onChange={() => toggleCheck(p.id)}
                className="w-4 h-4 rounded accent-purple-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${checklist[p.id] ? 'text-white/40 line-through' : 'text-white'}`}>{p.label}</div>
                <div className="text-white/30 text-[11px]">{p.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
