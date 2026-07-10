"use client"

import { CHANNELS, Channel, Show } from "@/lib/tv-data"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

const TIMES = ['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM']

interface EpgGridProps {
  activeChannelId: string
  activeShowId: string
  onSelectShow: (channelId: string, showId: string) => void
}

export function EpgGrid({ activeChannelId, activeShowId, onSelectShow }: EpgGridProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/5" style={{ background: '#0c0c18' }}>
      {/* EPG Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <Clock className="w-4 h-4 text-white/40" />
        <span className="text-white/70 text-sm font-semibold">TV Guide</span>
        <span className="text-white/30 text-xs">— Today's Schedule</span>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500 live-dot" />
          Live Now
        </div>
      </div>

      {/* Time headers */}
      <div className="flex border-b border-white/5">
        <div className="w-28 flex-shrink-0 px-3 py-2 text-[10px] text-white/20 font-semibold uppercase tracking-wider">
          Channel
        </div>
        <div className="flex-1 flex overflow-x-auto epg-scroll">
          {TIMES.map((t) => (
            <div key={t} className="flex-shrink-0 w-40 px-3 py-2 text-[10px] text-white/30 font-mono border-l border-white/5">
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      {CHANNELS.map((ch) => (
        <div key={ch.id} className={cn("flex border-b border-white/5 last:border-b-0 hover:bg-white/2 transition-colors", activeChannelId === ch.id && "bg-white/3")}>
          {/* Channel label */}
          <div className="w-28 flex-shrink-0 flex items-center gap-2 px-3 py-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: `${ch.color}22` }}
            >
              {ch.emoji}
            </div>
            <div>
              <div className="text-white text-[10px] font-semibold leading-tight">{ch.name}</div>
              <div className="text-white/30 text-[9px]">CH {ch.number}</div>
            </div>
          </div>

          {/* Shows in time grid */}
          <div className="flex-1 flex overflow-x-auto epg-scroll py-2 gap-1 pr-2">
            {ch.shows.map((show, i) => {
              const isActive = ch.id === activeChannelId && show.id === activeShowId
              const isNow = show.airTime === 'NOW LIVE'
              return (
                <button
                  key={show.id}
                  onClick={() => onSelectShow(ch.id, show.id)}
                  className={cn(
                    "flex-shrink-0 w-[154px] h-full min-h-[52px] rounded-lg px-3 py-2 text-left transition-all border",
                    isActive
                      ? "border-opacity-60 text-white"
                      : isNow
                      ? "border-white/10 text-white/80 hover:border-white/20"
                      : "border-white/5 text-white/50 hover:text-white/70 hover:border-white/10"
                  )}
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${ch.color}30, ${ch.color}10)`
                      : isNow
                      ? `${ch.color}12`
                      : 'rgba(255,255,255,0.02)',
                    borderColor: isActive ? ch.color : undefined
                  }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    {isNow && (
                      <span className="text-[8px] font-bold text-red-400 flex items-center gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-red-500 live-dot" />
                        NOW
                      </span>
                    )}
                    {!isNow && show.airTime && (
                      <span className="text-[8px] text-white/30 font-mono">{show.airTime}</span>
                    )}
                    <span className="text-[8px] text-white/20 ml-auto">{show.duration}</span>
                  </div>
                  <div className="text-[10px] font-semibold leading-tight truncate">{show.title}</div>
                  <div className="text-[9px] opacity-50 mt-0.5 truncate">{show.category}</div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
