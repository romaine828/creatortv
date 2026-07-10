"use client"

import { useState, useEffect } from "react"
import { Mic, BookOpen, Link2 } from "lucide-react"

interface SiteLinks {
  podcastUrl: string
  scriptureCardsUrl: string
  customLink1Label: string
  customLink1Url: string
}

// Passive, "set once and forget" — automatically shows links to your other properties
// so every CreatorTV visitor discovers your podcast, products, and other links.
export function CrossPromoBanner() {
  const [links, setLinks] = useState<SiteLinks | null>(null)

  useEffect(() => {
    fetch('/api/site-links').then(r => r.json()).then(setLinks).catch(() => {})
  }, [])

  if (!links) return null
  const items = [
    links.podcastUrl && { label: 'Listen to The Romaine Oda Show', url: links.podcastUrl, icon: Mic, color: '#a855f7' },
    links.scriptureCardsUrl && { label: 'Shop Scripture Cards', url: links.scriptureCardsUrl, icon: BookOpen, color: '#f59e0b' },
    links.customLink1Url && { label: links.customLink1Label || 'More from us', url: links.customLink1Url, icon: Link2, color: '#06b6d4' },
  ].filter(Boolean) as { label: string; url: string; icon: React.ElementType; color: string }[]

  if (items.length === 0) return null

  return (
    <div className="rounded-xl border border-white/8 overflow-hidden" style={{ background: '#0c0c18' }}>
      <div className="px-4 py-2 border-b border-white/5">
        <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">More From Us</span>
      </div>
      <div className="flex flex-wrap gap-2 p-3">
        {items.map(item => (
          <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: `${item.color}18`, color: item.color, border: `1px solid ${item.color}30` }}>
            <item.icon className="w-3.5 h-3.5" /> {item.label}
          </a>
        ))}
      </div>
    </div>
  )
}
