"use client"

import { cn } from "@/lib/utils"
import { Channel } from "@/lib/tv-data"
import { Tv, Wifi, ShoppingBag, Users, HelpCircle, Settings } from "lucide-react"

interface TvSidebarProps {
  activeChannelId: string
  onSelectChannel: (id: string) => void
  collapsed: boolean
  channels: Channel[]
  activeTab?: string
  onTabChange?: (tab: string) => void
  pendingCommunity?: number
}

export function TvSidebar({ activeChannelId, onSelectChannel, collapsed, channels, activeTab, onTabChange, pendingCommunity = 0 }: TvSidebarProps) {
  const navItems = [
    { id: 'store', icon: ShoppingBag, label: 'Merch Store', color: '#a855f7' },
    { id: 'community', icon: Users, label: 'Community Wall', color: '#06b6d4', badge: pendingCommunity },
    { id: 'qa', icon: HelpCircle, label: 'Q&A', color: '#f59e0b' },
    { id: 'admin', icon: Settings, label: 'Admin Page', color: '#f472b6', customHref: '/admin' },
  ]

  return (
    <aside
      className={cn(
        "flex flex-col h-full transition-all duration-300 border-r border-white/5",
        "bg-[#0c0c18]",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-white/5", collapsed && "justify-center px-0")}>
        <div className="relative flex-shrink-0">
          <img src="https://galaxy-prod.tlcdn.com/gen/user_2pjseNE93K3LWvS7IrybDgQX6sJ/259effb3-eaba-469d-b230-c243d54e3090.png" alt="CreatorTV" className="w-9 h-9 rounded-lg object-cover" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full live-dot" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-bold text-sm text-white leading-none">CreatorTV</div>
            <div className="text-[10px] text-white/40 mt-0.5">{channels.length} Channels Live</div>
          </div>
        )}
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-2">
        {!collapsed && (
          <div className="px-3 py-2">
            <span className="text-[10px] font-semibold text-white/30 tracking-widest uppercase">Channels</span>
          </div>
        )}
        {channels.map((ch) => {
          const isActive = ch.id === activeChannelId && (!activeTab || activeTab === 'tv')
          return (
            <button
              key={ch.id}
              onClick={() => { onSelectChannel(ch.id) }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 text-left transition-all relative group",
                collapsed ? "justify-center" : "",
                isActive ? "bg-white/8 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/4"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r-full" style={{ backgroundColor: ch.color }} />
              )}

              <div
                className={cn("flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all", isActive ? "scale-105" : "group-hover:scale-105")}
                style={{
                  background: isActive ? `linear-gradient(135deg, ${ch.color}33, ${ch.color}66)` : 'rgba(255,255,255,0.05)',
                  boxShadow: isActive ? `0 0 16px ${ch.color}44` : 'none'
                }}
              >
                {ch.emoji}
              </div>

              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-semibold", isActive ? "text-white" : "")}>{ch.name}</span>
                    <span className="text-[9px] font-mono text-white/20">CH {ch.number}</span>
                  </div>
                  <div className="text-[10px] text-white/30 mt-0.5 truncate">{ch.tagline}</div>
                </div>
              )}

              {!collapsed && isActive && (
                <span className="flex-shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" />
                  <span className="text-[9px] text-red-400 font-semibold">LIVE</span>
                </span>
              )}
            </button>
          )
        })}

        {/* Creator Tools nav */}
        {!collapsed && (
          <div className="px-3 pt-4 pb-2">
            <span className="text-[10px] font-semibold text-white/30 tracking-widest uppercase">Creator Tools</span>
          </div>
        )}
        {collapsed && <div className="my-2 mx-3 border-t border-white/5" />}
        {navItems.map(item => {
          const href = (item as any).customHref || `/studio?tab=${item.id}`
          return (
            <a
              key={item.id}
              href={href}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all relative group no-underline",
                collapsed ? "justify-center" : "",
                "text-white/50 hover:text-white/80 hover:bg-white/4"
              )}
              style={{ textDecoration: 'none' }}
            >
              <div
                className={cn("flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-105")}
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs font-semibold">{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="w-5 h-5 rounded-full bg-yellow-500 text-black text-[10px] font-bold flex items-center justify-center">{item.badge}</span>
                  ) : null}
                </div>
              )}
              {collapsed && item.badge && item.badge > 0 ? (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-yellow-500 text-black text-[9px] font-bold flex items-center justify-center">{item.badge}</span>
              ) : null}
            </a>
          )
        })}
      </div>

      {!collapsed && (
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-white/25 text-[10px]">
            <Wifi className="w-3 h-3" />
            <span>Streaming HD · {channels.length} channels</span>
          </div>
        </div>
      )}
    </aside>
  )
}
