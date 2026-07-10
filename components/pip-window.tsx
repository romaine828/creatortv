"use client"

import { Show, Channel } from "@/lib/tv-data"
import { X, Maximize2 } from "lucide-react"

interface PipWindowProps {
  show: Show
  channel: Channel
  onClose: () => void
  onExpand: () => void
}

export function PipWindow({ show, channel, onClose, onExpand }: PipWindowProps) {
  const embedUrl = `https://www.youtube.com/embed/${show.youtubeId}?autoplay=1&rel=0&modestbranding=1`

  return (
    <div className="pip-window" style={{ width: 320, height: 200 }}>
      {/* Iframe */}
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={`PiP: ${show.title}`}
      />

      {/* Controls overlay */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none hover:pointer-events-auto">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-2 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{channel.emoji}</span>
            <span className="text-white text-[10px] font-semibold truncate max-w-[150px]">{show.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onExpand}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <Maximize2 className="w-3 h-3 text-white" />
            </button>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-red-500/80 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>

        {/* Bottom channel badge */}
        <div className="absolute bottom-2 left-2">
          <div
            className="text-[8px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ background: channel.color }}
          >
            CH {channel.number} · {channel.name}
          </div>
        </div>
      </div>
    </div>
  )
}
