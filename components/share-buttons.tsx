"use client"

import { useState } from "react"
import { Copy, Check, Share2 } from "lucide-react"

interface ShareButtonsProps {
  url: string
  title: string
  compact?: boolean
}

// Drop this on any show/episode page — gives fans a one-click way to spread the word.
export function ShareButtons({ url, title, compact = false }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const links = [
    { label: 'X', color: '#ffffff', href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { label: 'Facebook', color: '#1877f2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: 'WhatsApp', color: '#25d366', href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
  ]

  const copyLink = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex items-center gap-1.5 ${compact ? '' : 'flex-wrap'}`}>
      {!compact && <span className="text-white/30 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 mr-1"><Share2 className="w-3 h-3" /> Share</span>}
      {links.map(l => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all hover:opacity-80"
          style={{ color: l.color, borderColor: `${l.color}40`, background: `${l.color}12` }}>
          {l.label}
        </a>
      ))}
      <button onClick={copyLink}
        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-white/15 text-white/50 hover:text-white transition-all flex items-center gap-1">
        {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Link</>}
      </button>
    </div>
  )
}
