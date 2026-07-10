"use client"

import { Show, Channel } from "@/lib/tv-data"
import { cn } from "@/lib/utils"
import { Play, Heart, Clock } from "lucide-react"

interface ShowCardProps {
  show: Show
  channel: Channel
  isActive: boolean
  isFavorite: boolean
  onSelect: () => void
  onToggleFavorite: (e: React.MouseEvent) => void
}

export function ShowCard({ show, channel, isActive, isFavorite, onSelect, onToggleFavorite }: ShowCardProps) {
  const thumbUrl = `https://img.youtube.com/vi/${show.youtubeId}/mqdefault.jpg`

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
      className={cn(
        "show-card group relative rounded-xl overflow-hidden text-left transition-all duration-200 flex-shrink-0 cursor-pointer",
        "w-44",
        isActive
          ? "ring-2 scale-[1.02]"
          : "hover:scale-[1.02] opacity-80 hover:opacity-100"
      )}
      style={isActive ? { '--tw-ring-color': channel.color } as any : {}}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-black/50 overflow-hidden">
        <img
          src={thumbUrl}
          alt={show.title}
          className="show-card-img w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${show.youtubeId}/0.jpg`
          }}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: channel.color }}
          >
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono backdrop-blur-sm">
          {show.duration}
        </div>

        {/* LIVE badge */}
        {show.airTime === 'NOW LIVE' && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-white live-dot" />
            LIVE
          </div>
        )}

        {/* Active playing indicator */}
        {isActive && (
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{ background: channel.color }}
          />
        )}
      </div>

      {/* Info */}
      <div
        className="p-2.5"
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${channel.color}20, #0c0c18)`
            : '#0e0e1c'
        }}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <div className="text-white text-xs font-semibold truncate leading-tight">{show.title}</div>
            <div className="text-white/40 text-[9px] mt-0.5 truncate">{show.host || show.category}</div>
          </div>
          <button
            onClick={onToggleFavorite}
            className="flex-shrink-0 p-0.5 rounded transition-colors"
          >
            <Heart
              className={cn("w-3 h-3 transition-colors", isFavorite ? "text-pink-400 fill-pink-400" : "text-white/20 hover:text-white/50")}
            />
          </button>
        </div>

        {/* Category + time */}
        <div className="flex items-center justify-between mt-1.5">
          <span
            className="text-[8px] font-semibold px-1.5 py-0.5 rounded-sm uppercase tracking-wider"
            style={{ background: `${channel.color}25`, color: channel.color }}
          >
            {show.category}
          </span>
          {show.airTime && show.airTime !== 'NOW LIVE' && (
            <span className="text-[9px] text-white/30 flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {show.airTime}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
