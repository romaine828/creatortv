"use client"

import { useState, useCallback, useEffect } from "react"
import { CHANNELS, Channel, Show } from "@/lib/tv-data"  // CHANNELS used as fallback only
import { TvSidebar } from "@/components/tv-sidebar"
import { VideoPlayer } from "@/components/video-player"
import { ShowCard } from "@/components/show-card"
import { EpgGrid } from "@/components/epg-grid"
import { PipWindow } from "@/components/pip-window"
import { SubscribeModal } from "@/components/subscribe-modal"
import { CreateChannelModal } from "@/components/create-channel-modal"
import { EditChannelModal } from "@/components/edit-channel-modal"
import { StoreManager } from "@/components/store-manager"
import { CommunityManager } from "@/components/community-manager"
import { CrossPromoBanner } from "@/components/cross-promo-banner"
import { ShareButtons } from "@/components/share-buttons"
import { cn } from "@/lib/utils"
import {
  Search, Bell, Heart, ChevronDown, ChevronUp,
  Menu, X, Tv, TrendingUp, Play, Star, Plus,
  Crown, Check, Zap, Lock, Pencil, ShoppingBag, Bot, ArrowLeft, Megaphone, Shield
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

type PlanType = 'none' | 'free' | 'creator' | 'vip'
type TabType = 'tv' | 'store' | 'community' | 'qa'

export default function TVApp() {
  const [activeTab, setActiveTab] = useState<TabType>('tv')
  const [appOrigin, setAppOrigin] = useState('')
  useEffect(() => { setAppOrigin(window.location.origin) }, [])

  // Capture affiliate referral code from URL (?ref=CODE) and remember it for 30 days
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      localStorage.setItem('creatortv_ref_code', ref.toUpperCase())
      localStorage.setItem('creatortv_ref_captured_at', new Date().toISOString())
      fetch('/api/affiliates/track', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ref.toUpperCase() })
      }).catch(() => {})
    }
  }, [])
  const [builtInChannels, setBuiltInChannels] = useState<Channel[]>([])
  const [channelsLoaded, setChannelsLoaded] = useState(false)
  const [userChannels, setUserChannels] = useState<Channel[]>([])
  const allChannels = [...builtInChannels, ...userChannels]

  const [activeChannelId, setActiveChannelId] = useState('inspirational')
  const [activeShowIndex, setActiveShowIndex] = useState(0)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showEPG, setShowEPG] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isPiP, setIsPiP] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Subscriptions: channelId → plan
  const [subscriptions, setSubscriptions] = useState<Record<string, PlanType>>({
    inspirational: 'none',
    educational: 'none',
    business: 'none',
    health: 'none',
    creator: 'none',
  })
  const [subscribeTarget, setSubscribeTarget] = useState<Channel | null>(null)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null)


  // Load channels from server on mount
  useEffect(() => {
    fetch('/api/channels')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBuiltInChannels(data)
        } else {
          setBuiltInChannels(CHANNELS)
        }
        setChannelsLoaded(true)
      })
      .catch(() => {
        setBuiltInChannels(CHANNELS)
        setChannelsLoaded(true)
      })
  }, [])

  const activeChannel = (channelsLoaded ? allChannels : []).find(c => c.id === activeChannelId) || allChannels[0] || builtInChannels[0] || CHANNELS[0]
  const activeShow = activeChannel?.shows?.[activeShowIndex]
  const activeShowFavoriteKey = `${activeChannelId}-${activeShow?.id}`

  const getChannelPlan = (id: string): PlanType => subscriptions[id] || 'none'

  const handleSelectChannel = useCallback((id: string) => {
    setActiveChannelId(id)
    setActiveShowIndex(0)
    setIsPiP(false)
  }, [])

  const handleSelectShow = useCallback((channelId: string, showId: string) => {
    setActiveChannelId(channelId)
    const ch = [...builtInChannels, ...userChannels].find(c => c.id === channelId)
    if (!ch) return
    const idx = ch.shows.findIndex(s => s.id === showId)
    setActiveShowIndex(idx >= 0 ? idx : 0)
    setIsPiP(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [builtInChannels, userChannels])

  const handleToggleFavorite = useCallback((key?: string) => {
    const k = key || activeShowFavoriteKey
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }, [activeShowFavoriteKey])

  const handleSubscribe = (plan: 'free' | 'creator' | 'vip') => {
    if (!subscribeTarget) return
    setSubscriptions(prev => ({ ...prev, [subscribeTarget.id]: plan }))
  }

  const handleCreateChannel = async (ch: Channel) => {
    setUserChannels(prev => [...prev, ch])
    setSubscriptions(prev => ({ ...prev, [ch.id]: 'free' }))
    setActiveChannelId(ch.id)
    setActiveShowIndex(0)
    try {
      await fetch('/api/channels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ch)
      })
    } catch { /* best effort */ }
  }

  // Save edits — persists to server so changes survive page refresh
  const handleSaveChannel = async (updated: Channel) => {
    const isBuiltIn = builtInChannels.some(c => c.id === updated.id)
    if (isBuiltIn) {
      setBuiltInChannels(prev => prev.map(c => c.id === updated.id ? updated : c))
    } else {
      setUserChannels(prev => prev.map(c => c.id === updated.id ? updated : c))
    }
    if (activeChannelId === updated.id && activeShowIndex >= updated.shows.length) {
      setActiveShowIndex(Math.max(0, updated.shows.length - 1))
    }
    // Save to server — so videos persist after page refresh
    try {
      await fetch('/api/channels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
    } catch { /* best effort */ }
    setEditingChannel(null)
  }

  const allFavoriteShows = allChannels.flatMap(ch =>
    ch.shows.filter(s => favorites.has(`${ch.id}-${s.id}`)).map(s => ({ ch, s }))
  )

  const searchResults = searchQuery.length > 1
    ? allChannels.flatMap(ch =>
        ch.shows.filter(s =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.host || '').toLowerCase().includes(searchQuery.toLowerCase())
        ).map(s => ({ ch, s }))
      )
    : []

  const planColor: Record<PlanType, string> = { none: '#6b7280', free: '#10b981', creator: '#a855f7', vip: '#f59e0b' }
  const planLabel: Record<PlanType, string> = { none: 'Subscribe', free: 'Free', creator: 'Creator', vip: 'VIP' }
  const planIcon: Record<PlanType, React.ReactNode> = {
    none: <Plus className="w-3 h-3" />,
    free: <Check className="w-3 h-3" />,
    creator: <Zap className="w-3 h-3" />,
    vip: <Crown className="w-3 h-3" />
  }

  // Is the user paid on ANY channel?
  const isPaid = Object.values(subscriptions).some(p => p === 'creator' || p === 'vip')

  interface ExclusiveItem { id: string; emoji: string; title: string; description: string; url: string; buttonLabel: string }
  const [exclusiveItems, setExclusiveItems] = useState<ExclusiveItem[]>([])
  useEffect(() => {
    fetch('/api/exclusive-content').then(r => r.json()).then(data => setExclusiveItems(Array.isArray(data) ? data : [])).catch(() => {})
  }, [])

  if (!activeChannel || !activeShow) return null

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#070710' }}>
      {/* Sidebar */}
      <TvSidebar
        activeChannelId={activeChannelId}
        onSelectChannel={handleSelectChannel}
        collapsed={sidebarCollapsed}
        channels={allChannels}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
        pendingCommunity={0}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Store tab */}
        {activeTab === 'store' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/5" style={{ background: '#0a0a16' }}>
              <button onClick={() => setActiveTab('tv')}
                className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to TV
              </button>
            </div>
            <StoreManager appUrl={appOrigin} />
          </div>
        )}
        {/* Community tab */}
        {activeTab === 'community' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/5" style={{ background: '#0a0a16' }}>
              <button onClick={() => setActiveTab('tv')}
                className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to TV
              </button>
            </div>
            <CommunityManager />
          </div>
        )}

        {/* Q&A tab */}
        {activeTab === 'qa' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/5" style={{ background: '#0a0a16' }}>
              <button onClick={() => setActiveTab('tv')}
                className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to TV
              </button>
            </div>
            <CommunityManager defaultTab="qa" />
          </div>
        )}

        {/* TV tab wrapper */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={activeTab !== 'tv' ? { display: 'none' } : {}}>

        {/* Top Navigation */}
        <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/5" style={{ background: '#0a0a16' }}>
          <button onClick={() => setSidebarCollapsed(p => !p)}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all">
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <img src="https://galaxy-prod.tlcdn.com/gen/user_2pjseNE93K3LWvS7IrybDgQX6sJ/259effb3-eaba-469d-b230-c243d54e3090.png" alt="CreatorTV" className="w-7 h-7 rounded-md object-cover flex-shrink-0" />
            <span className="font-black text-lg tracking-tight gradient-text"
              style={{ backgroundImage: `linear-gradient(90deg, ${activeChannel.color}, #ec4899)` }}>
              CreatorTV
            </span>
            <span className="text-white/20">/</span>
            <span className="text-white/60 text-sm font-medium">{activeChannel.name}</span>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            {showSearch ? (
              <div className="flex items-center gap-2">
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search shows, topics, hosts..."
                  className="w-56 bg-white/8 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder-white/30 outline-none focus:border-white/30 transition-colors" />
                <button onClick={() => { setShowSearch(false); setSearchQuery('') }}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowSearch(true)}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all">
                <Search className="w-4 h-4" />
              </button>
            )}
            {searchResults.length > 0 && showSearch && (
              <div className="absolute top-full right-0 mt-2 w-80 rounded-xl border border-white/10 overflow-hidden z-50 shadow-2xl" style={{ background: '#12121e' }}>
                <div className="px-3 py-2 border-b border-white/5 text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                  {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''}
                </div>
                {searchResults.map(({ ch, s }) => (
                  <button key={s.id} onClick={() => { handleSelectShow(ch.id, s.id); setShowSearch(false); setSearchQuery('') }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden">
                      <img src={`https://img.youtube.com/vi/${s.youtubeId}/mqdefault.jpg`} alt={s.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-xs font-semibold truncate">{s.title}</div>
                      <div className="text-white/40 text-[10px]">{ch.name} · {s.category}</div>
                    </div>
                    <span className="text-xl flex-shrink-0">{ch.emoji}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favorites */}
          <button onClick={() => setShowFavorites(p => !p)}
            className={cn("relative p-2 rounded-lg transition-all", showFavorites ? "text-pink-400 bg-pink-500/15" : "text-white/40 hover:text-white hover:bg-white/8")}>
            <Heart className={cn("w-4 h-4", showFavorites && "fill-pink-400")} />
            {favorites.size > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-pink-500 text-white text-[8px] font-bold flex items-center justify-center">{favorites.size}</span>
            )}
          </button>

          {/* Create Channel CTA */}
          <button onClick={() => setShowCreateChannel(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', boxShadow: '0 0 20px rgba(168,85,247,0.3)' }}>
            <Plus className="w-3.5 h-3.5" /> Create Channel
          </button>

          <button className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all">
            <Bell className="w-4 h-4" />
          </button>

          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: `linear-gradient(135deg, ${activeChannel.color}, #ec4899)` }}>
            C
          </div>
        </header>

        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-5">

            {/* Favorites Panel */}
            {showFavorites && (
              <div className="rounded-2xl border border-pink-500/20 p-4 bg-pink-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                  <span className="text-white font-semibold text-sm">My Favorites</span>
                  <Badge variant="secondary" className="text-[10px] bg-pink-500/20 text-pink-300 border-0">{allFavoriteShows.length} saved</Badge>
                </div>
                {allFavoriteShows.length === 0 ? (
                  <div className="text-white/30 text-sm py-4 text-center">No favorites yet — tap ♥ on any show to save it here!</div>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {allFavoriteShows.map(({ ch, s }) => (
                      <ShowCard key={`${ch.id}-${s.id}`} show={s} channel={ch}
                        isActive={ch.id === activeChannelId && s.id === activeShow.id} isFavorite
                        onSelect={() => handleSelectShow(ch.id, s.id)}
                        onToggleFavorite={e => { e.stopPropagation(); handleToggleFavorite(`${ch.id}-${s.id}`) }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Channel tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {allChannels.map(ch => (
                <button key={ch.id} onClick={() => handleSelectChannel(ch.id)}
                  className={cn("flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all border",
                    activeChannelId === ch.id ? "text-white border-transparent" : "text-white/50 border-white/8 hover:text-white/80 hover:border-white/15 bg-white/3")}
                  style={activeChannelId === ch.id ? {
                    background: `linear-gradient(135deg, ${ch.color}30, ${ch.color}15)`,
                    borderColor: `${ch.color}50`,
                    boxShadow: `0 0 20px ${ch.color}25`
                  } : {}}>
                  <span>{ch.emoji}</span>
                  <span className="hidden sm:inline">{ch.name}</span>
                  {ch.id === activeChannelId && <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: ch.color }} />}
                  {/* Subscription badge */}
                  {getChannelPlan(ch.id) !== 'none' && (
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                      style={{ background: planColor[getChannelPlan(ch.id)] }}>
                      {planIcon[getChannelPlan(ch.id)]}
                    </span>
                  )}
                </button>
              ))}
              {/* Add channel shortcut */}
              <button onClick={() => setShowCreateChannel(true)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-dashed border-white/15 text-white/30 hover:text-white/60 hover:border-white/30 transition-all">
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New</span>
              </button>
            </div>

            {/* ── SUBSCRIPTION BANNER for current channel ── */}
            {getChannelPlan(activeChannelId) === 'none' ? (
              <div className="rounded-2xl p-4 flex items-center justify-between gap-4"
                style={{ background: `linear-gradient(135deg, ${activeChannel.color}18, #0c0c18)`, border: `1px solid ${activeChannel.color}30` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${activeChannel.color}25` }}>{activeChannel.emoji}</div>
                  <div>
                    <div className="text-white font-semibold text-sm">Subscribe to {activeChannel.name}</div>
                    <div className="text-white/40 text-xs">Get unlimited access · Free or Paid plans available</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => { setSubscribeTarget(activeChannel); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${activeChannel.color}, #ec4899)`, boxShadow: `0 0 20px ${activeChannel.color}40` }}>
                    <Zap className="w-3.5 h-3.5" /> Subscribe
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl px-4 py-2.5 flex items-center justify-between"
                style={{ background: `${planColor[getChannelPlan(activeChannelId)]}15`, border: `1px solid ${planColor[getChannelPlan(activeChannelId)]}25` }}>
                <div className="flex items-center gap-2 text-sm">
                  <span style={{ color: planColor[getChannelPlan(activeChannelId)] }}>{planIcon[getChannelPlan(activeChannelId)]}</span>
                  <span className="text-white/70">You're subscribed on the</span>
                  <span className="font-bold text-white">{planLabel[getChannelPlan(activeChannelId)]}</span>
                  <span className="text-white/70">plan</span>
                </div>
                <button onClick={() => setSubscribeTarget(activeChannel)}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors">Manage →</button>
              </div>
            )}

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <VideoPlayer
                  channel={activeChannel} show={activeShow}
                  isFavorite={favorites.has(activeShowFavoriteKey)}
                  onToggleFavorite={() => handleToggleFavorite()}
                  onPiP={() => setIsPiP(p => !p)}
                  onPrevShow={() => setActiveShowIndex(p => Math.max(0, p - 1))}
                  onNextShow={() => setActiveShowIndex(p => Math.min(activeChannel.shows.length - 1, p + 1))}
                  isPiPActive={isPiP}
                />

                {/* Description */}
                <div className="rounded-xl p-4"
                  style={{ background: `linear-gradient(135deg, ${activeChannel.color}12, #0c0c18)`, border: `1px solid ${activeChannel.color}20` }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider text-white"
                          style={{ background: activeChannel.color }}>{activeShow.category}</span>
                        <span className="text-white/30 text-[10px]">{activeShow.duration}</span>
                        {activeShow.airTime === 'NOW LIVE' && (
                          <span className="flex items-center gap-1 text-red-400 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" />LIVE NOW
                          </span>
                        )}
                      </div>
                      <h2 className="text-white font-bold text-lg leading-tight">{activeShow.title}</h2>
                      {activeShow.host && <div className="text-white/50 text-xs mt-0.5">with {activeShow.host}</div>}
                      <p className="text-white/50 text-sm mt-2 leading-relaxed">{activeShow.description}</p>
                      <div className="mt-3">
                        <ShareButtons url={appOrigin ? `${appOrigin}/?channel=${activeChannel.id}&show=${activeShow.id}` : ''} title={activeShow.title} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right panel */}
              <div className="space-y-4">
                {/* Channel card with subscribe + edit */}
                <div className="rounded-2xl p-5 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${activeChannel.color}20, #0c0c18)`, border: `1px solid ${activeChannel.color}25` }}>

                  {/* Edit button — top right */}
                  <button
                    onClick={() => setEditingChannel(activeChannel)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/40 hover:text-white transition-all"
                    title="Edit channel videos">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-4xl mb-3">{activeChannel.emoji}</div>
                  <div className="text-xl font-black gradient-text mb-1"
                    style={{ backgroundImage: `linear-gradient(90deg, ${activeChannel.color}, #ec4899)` }}>
                    {activeChannel.name}
                  </div>
                  <div className="text-white/50 text-xs mb-3">{activeChannel.tagline}</div>

                  {/* Sub status */}
                  {getChannelPlan(activeChannelId) === 'none' ? (
                    <button onClick={() => setSubscribeTarget(activeChannel)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                      style={{ background: `linear-gradient(135deg, ${activeChannel.color}, #ec4899)` }}>
                      <Zap className="w-4 h-4" /> Subscribe Now
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 border"
                      style={{ borderColor: `${planColor[getChannelPlan(activeChannelId)]}40`, color: planColor[getChannelPlan(activeChannelId)], background: `${planColor[getChannelPlan(activeChannelId)]}10` }}>
                      {planIcon[getChannelPlan(activeChannelId)]}
                      {planLabel[getChannelPlan(activeChannelId)]} Plan Active
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-white/8 flex items-center gap-3 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Play className="w-3 h-3" />{activeChannel.shows.length} shows</span>
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />Trending</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" />4.9★</span>
                  </div>
                </div>

                {/* Up Next */}
                <div>
                  <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2.5 px-1">Up Next</div>
                  <div className="space-y-2">
                    {activeChannel.shows.filter((_, i) => i !== activeShowIndex).slice(0, 3).map(show => {
                      const key = `${activeChannelId}-${show.id}`
                      const idx = activeChannel.shows.indexOf(show)
                      return (
                        <div key={show.id}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all text-left group cursor-pointer"
                          onClick={() => setActiveShowIndex(idx)} role="button" tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && setActiveShowIndex(idx)}>
                          <div className="relative flex-shrink-0 w-16 aspect-video rounded-lg overflow-hidden bg-black/50">
                            <img src={`https://img.youtube.com/vi/${show.youtubeId}/mqdefault.jpg`} alt={show.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={e => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${show.youtubeId}/0.jpg` }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white text-xs font-semibold truncate leading-tight">{show.title}</div>
                            <div className="text-white/35 text-[10px] mt-0.5">{show.host || show.category}</div>
                          </div>
                          <button onClick={e => { e.stopPropagation(); handleToggleFavorite(key) }} className="flex-shrink-0 p-1">
                            <Heart className={cn("w-3.5 h-3.5 transition-colors", favorites.has(key) ? "text-pink-400 fill-pink-400" : "text-white/20 group-hover:text-white/40")} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Shows row */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white font-semibold text-sm">All Shows on {activeChannel.name}</span>
                <span className="text-white/30 text-xs">{activeChannel.shows.length} episodes</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3">
                {activeChannel.shows.map((show, idx) => {
                  const key = `${activeChannelId}-${show.id}`
                  return (
                    <ShowCard key={show.id} show={show} channel={activeChannel}
                      isActive={idx === activeShowIndex} isFavorite={favorites.has(key)}
                      onSelect={() => setActiveShowIndex(idx)}
                      onToggleFavorite={e => { e.stopPropagation(); handleToggleFavorite(key) }} />
                  )
                })}
              </div>
            </div>

            {/* All Channels grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-white/40" />
                  <span className="text-white font-semibold text-sm">All Channels ({allChannels.length})</span>
                </div>
                <button onClick={() => setShowCreateChannel(true)}
                  className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Create Channel
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {allChannels.map(ch => {
                  const plan = getChannelPlan(ch.id)
                  return (
                    <div key={ch.id} className="relative group">
                      <div onClick={() => handleSelectChannel(ch.id)}
                        role="button" tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && handleSelectChannel(ch.id)}
                        className={cn("channel-card relative rounded-2xl p-4 text-left border overflow-hidden w-full cursor-pointer",
                          activeChannelId === ch.id ? "border-opacity-50" : "border-white/8 hover:border-white/15")}
                        style={{
                          background: `linear-gradient(135deg, ${ch.color}15, #0c0c18)`,
                          borderColor: activeChannelId === ch.id ? ch.color : undefined,
                          boxShadow: activeChannelId === ch.id ? `0 0 25px ${ch.color}25` : 'none'
                        }}>
                        <div className="text-3xl mb-2">{ch.emoji}</div>
                        <div className="text-white font-bold text-sm">{ch.name}</div>
                        <div className="text-white/40 text-[10px] mt-0.5 leading-tight">{ch.tagline}</div>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span className="flex items-center gap-1 text-[9px] text-white/30">
                            <Play className="w-2.5 h-2.5" />{ch.shows.length} shows
                          </span>
                          {plan !== 'none' ? (
                            <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                              style={{ background: planColor[plan] }}>
                              {planIcon[plan]} {planLabel[plan]}
                            </span>
                          ) : (
                            <button onClick={e => { e.stopPropagation(); setSubscribeTarget(ch) }}
                              className="text-[9px] px-1.5 py-0.5 rounded-full border border-white/15 text-white/40 hover:text-white/70 hover:border-white/30 transition-all flex items-center gap-0.5">
                              <Plus className="w-2.5 h-2.5" /> Sub
                            </button>
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60"
                          style={{ background: `linear-gradient(90deg, ${ch.color}, transparent)` }} />
                      </div>

                      {/* Edit button — appears on hover */}
                      <button
                        onClick={e => { e.stopPropagation(); setEditingChannel(ch) }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-all opacity-0 group-hover:opacity-100 z-10"
                        title="Edit channel videos">
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}

                {/* Create new channel card */}
                <button onClick={() => setShowCreateChannel(true)}
                  className="channel-card rounded-2xl p-4 text-left border border-dashed border-white/12 hover:border-white/25 transition-all flex flex-col items-center justify-center gap-2 text-center min-h-[140px]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white/40" />
                  </div>
                  <div>
                    <div className="text-white/50 text-xs font-semibold">Create Channel</div>
                    <div className="text-white/25 text-[10px] mt-0.5">Launch your own show</div>
                  </div>
                </button>
              </div>
            </div>


            {/* ── AD BANNER (free members only) ── */}
            {!isPaid && (
              <div className="rounded-xl overflow-hidden border border-white/8">
                <div className="px-3 py-1.5 flex items-center justify-between" style={{ background: '#0c0c18' }}>
                  <div className="flex items-center gap-1.5">
                    <Megaphone className="w-3 h-3 text-white/20" />
                    <span className="text-[9px] text-white/20 font-semibold uppercase tracking-wider">Advertisement</span>
                  </div>
                  <span className="text-[9px] text-purple-400/60 cursor-pointer hover:text-purple-400 transition-colors" onClick={() => setSubscribeTarget(activeChannel)}>
                    Go ad-free ⚡
                  </span>
                </div>
                {/* ── YOUR AD GOES HERE ── paste your Google AdSense or sponsor image below ── */}
                <div className="w-full flex items-center justify-center py-6 text-white/15 text-xs font-medium select-none"
                  style={{ background: 'linear-gradient(135deg, #0e0e1c, #12121e)', minHeight: '90px' }}>
                  <div className="text-center">
                    <Megaphone className="w-6 h-6 mx-auto mb-1 text-white/10" />
                    <div className="text-white/20 text-[10px]">Your ad or sponsor banner goes here</div>
                    <div className="text-white/10 text-[9px] mt-0.5">728 × 90 leaderboard · Replace this div with your ad code</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── EXCLUSIVE MEMBER CONTENT ── */}
            <div className="rounded-2xl overflow-hidden border"
              style={{ borderColor: isPaid ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.06)' }}>
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between"
                style={{ background: isPaid ? 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.08))' : 'linear-gradient(135deg, rgba(107,114,128,0.08), transparent)' }}>
                <div className="flex items-center gap-2">
                  {isPaid
                    ? <Shield className="w-4 h-4 text-purple-400" />
                    : <Lock className="w-4 h-4 text-white/30" />}
                  <span className={isPaid ? "text-white font-semibold text-sm" : "text-white/40 font-semibold text-sm"}>
                    {isPaid ? '⚡ Members-Only Exclusive Content' : '🔒 Exclusive Member Content'}
                  </span>
                  {isPaid && <span className="text-[9px] px-2 py-0.5 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>UNLOCKED</span>}
                </div>
                {!isPaid && (
                  <button onClick={() => setSubscribeTarget(activeChannel)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                    <Zap className="w-3 h-3" /> Unlock
                  </button>
                )}
              </div>

              {isPaid ? (
                /* PAID MEMBERS — show exclusive content */
                <div className="p-5" style={{ background: '#0c0c18' }}>
                  <div className="text-white/50 text-xs mb-4">Welcome, member! 🎉 Enjoy your exclusive content below.</div>

                  {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      ✏️  ADD YOUR EXCLUSIVE CONTENT HERE
                      Each card below is one piece of exclusive content.
                      Change the emoji, title, description, and link for each one.
                      To add a YouTube video link: set url to your YouTube URL.
                      To add more cards: copy one of the blocks and paste it in.
                  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

                  <div className="flex flex-col gap-3">
                    {exclusiveItems.length === 0 ? (
                      <div className="text-center py-6 text-white/30 text-xs">
                        No exclusive content yet.{' '}
                        <a href="/admin" className="text-purple-300 hover:text-purple-200 underline">Add some in the Admin Page →</a>
                      </div>
                    ) : (
                      exclusiveItems.map(item => (
                        <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-4 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/50 transition-all group"
                          style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08), #0e0e1c)' }}>
                          <div className="text-3xl flex-shrink-0">{item.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-bold">{item.title}</div>
                            <div className="text-white/40 text-[11px] mt-0.5">{item.description}</div>
                          </div>
                          <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-purple-300 border border-purple-500/30 group-hover:bg-purple-500/20 transition-colors flex-shrink-0">
                            {item.buttonLabel}
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* FREE USERS — teaser with blur/lock */
                <div className="relative overflow-hidden" style={{ background: '#0c0c18' }}>
                  <div className="p-5 grid grid-cols-3 gap-3 select-none pointer-events-none" style={{ filter: 'blur(6px)', opacity: 0.4 }}>
                    {['🎬 Behind the Scenes', '🎙️ Members Q&A', '📚 Premium Guides'].map(t => (
                      <div key={t} className="rounded-xl p-4 border border-white/8 text-center">
                        <div className="text-3xl mb-2">{t.split(' ')[0]}</div>
                        <div className="text-white text-xs font-bold">{t.split(' ').slice(1).join(' ')}</div>
                        <div className="text-white/40 text-[10px] mt-1">Exclusive for members</div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.2))' }}>
                      <Lock className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold text-sm">Exclusive Content Locked</div>
                      <div className="text-white/40 text-xs mt-1">Creator Pass or VIP membership required</div>
                    </div>
                    <button onClick={() => setSubscribeTarget(activeChannel)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', boxShadow: '0 0 20px rgba(168,85,247,0.4)' }}>
                      <Zap className="w-4 h-4" /> Upgrade to Unlock
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Subscription Tiers Info */}
            <div className="rounded-2xl overflow-hidden border border-white/5">
              <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1), transparent)' }}>
                <Crown className="w-4 h-4 text-purple-400" />
                <span className="text-white font-semibold text-sm">Subscription Plans</span>
                <span className="text-white/30 text-xs">— Support your favorite channels</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/5">
                {[
                  { icon: '🆓', name: 'Free', price: '$0', color: '#10b981', features: ['All 5 channels', 'Unlimited shows', 'Standard quality'] },
                  { icon: '⚡', name: 'Creator Pass', price: '$9.99/mo', color: '#a855f7', features: ['Unlimited shows', 'HD streaming', 'Ad-free + exclusives'] },
                  { icon: '👑', name: 'VIP All-Access', price: '$19.99/mo', color: '#f59e0b', features: ['Everything + 1-on-1', 'Create channels FREE', 'Live participation'] },
                ].map(tier => (
                  <div key={tier.name} className="px-4 py-4" style={{ background: '#0c0c18' }}>
                    <div className="text-2xl mb-2">{tier.icon}</div>
                    <div className="text-white font-bold text-sm">{tier.name}</div>
                    <div className="font-black text-lg mb-2" style={{ color: tier.color }}>{tier.price}</div>
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 mb-1">
                        <Check className="w-3 h-3 flex-shrink-0" style={{ color: tier.color }} />
                        <span className="text-white/50 text-[10px]">{f}</span>
                      </div>
                    ))}
                    <button onClick={() => setSubscribeTarget(activeChannel)}
                      className="mt-3 w-full py-1.5 rounded-lg text-[10px] font-bold text-white transition-all hover:opacity-90"
                      style={{ background: tier.color }}>
                      Get {tier.name}
                    </button>
                  </div>
                ))}
              </div>
              <a href="/affiliate" className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-green-300 hover:text-green-200 border-t border-white/5 transition-colors"
                style={{ background: '#0c0c18' }}>
                💰 Earn money promoting CreatorTV — become an Affiliate →
              </a>
            </div>

            <CrossPromoBanner />

            {/* EPG */}
            <div>
              <button onClick={() => setShowEPG(p => !p)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/15 transition-all text-white/60 hover:text-white">
                <span className="flex items-center gap-2 text-sm font-semibold">📅 TV Guide — Today's Schedule</span>
                {showEPG ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showEPG && (
                <div className="mt-3">
                  <EpgGrid activeChannelId={activeChannelId} activeShowId={activeShow.id} onSelectShow={handleSelectShow} />
                </div>
              )}
            </div>

            {/* Ticker */}
            <div className="rounded-xl px-4 py-2 overflow-hidden border border-white/5" style={{ background: '#0c0c18' }}>
              <div className="ticker-content">
                {[
                  "✨ NOW LIVE on Inspire TV · 📚 Edu Hub · 💼 Biz Network · 💚 Wellness TV · 🎬 Creator Network",
                  "⚡ Subscribe free or upgrade to Creator Pass from $9.99/month · 👑 VIP All-Access from $19.99/month",
                  "🚀 Create your own channel — click 'Create Channel' to launch your show today!",
                  "✨ NOW LIVE on Inspire TV · 📚 Edu Hub · 💼 Biz Network · 💚 Wellness TV · 🎬 Creator Network",
                  "⚡ Subscribe free or upgrade to Creator Pass from $9.99/month · 👑 VIP All-Access from $19.99/month",
                  "🚀 Create your own channel — click 'Create Channel' to launch your show today!",
                ].map((item, i) => (
                  <span key={i} className="text-white/30 text-[10px] px-8">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PiP */}
      {isPiP && (
        <PipWindow show={activeShow} channel={activeChannel} onClose={() => setIsPiP(false)} onExpand={() => setIsPiP(false)} />
      )}

      {/* Subscribe Modal */}
      {subscribeTarget && (
        <SubscribeModal
          channel={subscribeTarget}
          currentPlan={getChannelPlan(subscribeTarget.id)}
          onSubscribe={handleSubscribe}
          onClose={() => setSubscribeTarget(null)}
        />
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <CreateChannelModal
          onClose={() => setShowCreateChannel(false)}
          onCreateChannel={handleCreateChannel}
          existingCount={allChannels.length}
        />
      )}

        </div>{/* end TV tab wrapper */}

      {/* Edit Channel Modal */}
      {editingChannel && (
        <EditChannelModal
          channel={editingChannel}
          onSave={handleSaveChannel}
          onClose={() => setEditingChannel(null)}
        />
      )}
    </div>
  )
}
