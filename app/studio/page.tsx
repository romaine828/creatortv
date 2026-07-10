"use client"

import { useState } from "react"
import { CommunityManager } from "@/components/community-manager"
import { StoreManager } from "@/components/store-manager"
import { ArrowLeft, Users, HelpCircle, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = 'community' | 'qa' | 'store'

export default function StudioPage() {
  const [tab, setTab] = useState<Tab>('community')
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const defaultTabParam = searchParams?.get('tab') as Tab | null

  // Use URL param on first render
  const [initialized, setInitialized] = useState(false)
  if (!initialized && defaultTabParam && ['community', 'qa', 'store'].includes(defaultTabParam)) {
    setTab(defaultTabParam)
    setInitialized(true)
  }

  const tabs = [
    { id: 'community' as Tab, label: 'Community Wall', icon: Users, color: '#06b6d4' },
    { id: 'qa' as Tab, label: 'Q&A', icon: HelpCircle, color: '#f59e0b' },
    { id: 'store' as Tab, label: 'Merch Store', icon: ShoppingBag, color: '#a855f7' },
  ]

  return (
    <div className="flex flex-col h-screen" style={{ background: '#070710' }}>
      {/* Header */}
      <header className="flex-shrink-0 flex items-center gap-4 px-4 py-3 border-b border-white/5" style={{ background: '#0a0a16' }}>
        <a href="/"
          className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to TV
        </a>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                tab === t.id ? "text-white shadow-sm" : "text-white/40 hover:text-white/70")}
              style={tab === t.id ? { background: `${t.color}20`, color: t.color } : {}}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'community' && <CommunityManager defaultTab="wall" />}
        {tab === 'qa' && <CommunityManager defaultTab="qa" />}
        {tab === 'store' && <StoreManager appUrl="" />}
      </div>
    </div>
  )
}
