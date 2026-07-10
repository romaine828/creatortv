"use client"

import { useState, useEffect } from "react"
import { Channel } from "@/lib/tv-data"
import { EditChannelModal } from "@/components/edit-channel-modal"
import { ExclusiveContentManager } from "@/components/exclusive-content-manager"
import { AffiliateAdminManager } from "@/components/affiliate-admin-manager"
import { GrowthManager } from "@/components/growth-manager"
import { ArrowLeft, Tv, Star, Radio, Pencil, Play, Lock, DollarSign, Link2 } from "lucide-react"

type Tab = 'videos' | 'exclusive' | 'live' | 'affiliates' | 'growth'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('videos')
  const [channels, setChannels] = useState<Channel[]>([])
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)

  const loadChannels = () => {
    fetch('/api/channels').then(r => r.json()).then(data => {
      setChannels(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }

  useEffect(() => { loadChannels() }, [])

  const handleSaveChannel = async (updated: Channel) => {
    await fetch('/api/channels', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })
    loadChannels()
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#070710' }}>
      {/* Header */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/5" style={{ background: '#0a0a16' }}>
        <a href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-purple-400 border border-purple-500/30 hover:bg-purple-500/10 transition-all">
          <ArrowLeft className="w-3 h-3" /> Back to TV
        </a>
        <div className="text-white font-bold text-sm ml-2">⚙️ CreatorTV Admin</div>
        <div className="flex-1" />
        <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
          {[
            { id: 'videos' as Tab, label: 'Manage Videos', icon: Tv },
            { id: 'exclusive' as Tab, label: 'Exclusive Content', icon: Star },
            { id: 'affiliates' as Tab, label: 'Affiliates', icon: DollarSign },
            { id: 'growth' as Tab, label: 'Growth', icon: Link2 },
            { id: 'live' as Tab, label: 'Live TV', icon: Radio },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${tab === t.id ? 'bg-purple-500/25 text-white' : 'text-white/40 hover:text-white/70'}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">

        {/* MANAGE VIDEOS TAB */}
        {tab === 'videos' && (
          <div className="max-w-2xl mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">📺 Manage Your Channels &amp; Videos</h1>
              <p className="text-white/40 text-sm">Click a channel to add, edit, or remove videos — supports YouTube, TikTok, uploaded files, or any direct video link.</p>
            </div>

            {loading ? (
              <div className="text-white/30 text-sm text-center py-8">Loading channels...</div>
            ) : (
              <div className="flex flex-col gap-2">
                {channels.map(channel => (
                  <button key={channel.id} onClick={() => setEditingChannel(channel)}
                    className="flex items-center gap-4 rounded-xl p-4 border border-white/8 hover:border-white/20 transition-all text-left"
                    style={{ background: '#0e0e1c' }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `${channel.color}25` }}>
                      {channel.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm">{channel.name}</div>
                      <div className="text-white/40 text-xs mt-0.5">
                        {channel.shows.length} video{channel.shows.length !== 1 ? 's' : ''}
                        {channel.shows.some(s => s.exclusive) && (
                          <span className="ml-2 text-yellow-400 inline-flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> {channel.shows.filter(s => s.exclusive).length} exclusive</span>
                        )}
                        {channel.shows.some(s => s.isLive) && (
                          <span className="ml-2 text-red-400 inline-flex items-center gap-0.5"><Radio className="w-2.5 h-2.5" /> Live</span>
                        )}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-white/50 flex-shrink-0">
                      <Pencil className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 rounded-xl p-4 border border-purple-500/15 text-[11px] text-white/40 leading-relaxed" style={{ background: 'rgba(168,85,247,0.04)' }}>
              <strong className="text-purple-300/70">💡 Tip:</strong> When editing a video, choose your source (YouTube, TikTok, Upload, or Direct Link), then check "⭐ Exclusive" to make it members-only, or "🔴 Live" to mark it as a live broadcast.
            </div>
          </div>
        )}

        {/* EXCLUSIVE CONTENT TAB */}
        {tab === 'exclusive' && <ExclusiveContentManager />}

        {/* AFFILIATES TAB */}
        {tab === 'affiliates' && <AffiliateAdminManager />}

        {/* GROWTH TAB */}
        {tab === 'growth' && <GrowthManager />}

        {/* LIVE TV TAB */}
        {tab === 'live' && (
          <div className="max-w-2xl mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <Radio className="w-6 h-6 text-red-400" /> Live TV
              </h1>
              <p className="text-white/40 text-sm">Go live on CreatorTV using YouTube Live — no extra setup or streaming service needed.</p>
            </div>

            <div className="rounded-2xl p-5 mb-4 border border-white/8" style={{ background: '#0c0c18' }}>
              <div className="text-white font-semibold text-sm mb-3">✅ The Easy Way — YouTube Live (Free)</div>
              <ol className="text-white/50 text-xs space-y-2 list-decimal list-inside">
                <li>Go live on YouTube using YouTube Studio or your phone's YouTube app</li>
                <li>Copy the link to your live stream (it looks like a normal YouTube video link while it's live)</li>
                <li>Go to <strong className="text-white/70">Manage Videos</strong> tab above → pick a channel → Add New Video</li>
                <li>Choose <strong className="text-white/70">YouTube</strong> as the source, paste the live link</li>
                <li>Check the <strong className="text-red-300">🔴 Mark as LIVE now</strong> box and save</li>
              </ol>
              <div className="mt-3 text-white/30 text-[11px]">Your show will show a pulsing 🔴 LIVE badge on CreatorTV automatically, and it updates in real time as your YouTube stream plays.</div>
            </div>

            <div className="rounded-2xl p-5 border border-yellow-500/15" style={{ background: 'rgba(234,179,8,0.04)' }}>
              <div className="text-yellow-300/80 font-semibold text-sm mb-2">⚠️ Custom Live Streaming (Bigger Project)</div>
              <p className="text-white/40 text-xs leading-relaxed">
                True independent live broadcasting — without YouTube — needs a paid streaming service behind the scenes (like Mux or Cloudflare Stream) to actually receive and broadcast your camera feed. This is a bigger technical project with ongoing hosting costs. If you outgrow YouTube Live and want this built, just ask — we can plan it out together.
              </p>
            </div>
          </div>
        )}

      </div>

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
