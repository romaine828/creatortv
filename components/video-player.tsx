"use client"

import { useState } from "react"
import { Channel, Show } from "@/lib/tv-data"
import { cn } from "@/lib/utils"
import { AlertCircle, ChevronLeft, ChevronRight, Heart, PictureInPicture2 } from "lucide-react"

interface VideoPlayerProps {
  channel: Channel
  show: Show
  isFavorite: boolean
  onToggleFavorite: () => void
  onPiP: () => void
  onPrevShow: () => void
  onNextShow: () => void
  isPiPActive: boolean
}

export function VideoPlayer({ channel, show, isFavorite, onToggleFavorite, onPiP, onPrevShow, onNextShow, isPiPActive }: VideoPlayerProps) {
  const [videoError, setVideoError] = useState(false)
  const [videoKey, setVideoKey] = useState(0)

  const videoType = show.videoType || 'youtube'

  // Use youtube-nocookie for better embedding + privacy
  const embedUrl = `https://www.youtube-nocookie.com/embed/${show.youtubeId}?rel=0&modestbranding=1&color=white&iv_load_policy=3`

  const tiktokEmbedUrl = (() => {
    if (!show.videoUrl) return ''
    const match = show.videoUrl.match(/video\/(\d+)/)
    return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : ''
  })()

  const handleRetry = () => {
    setVideoError(false)
    setVideoKey(k => k + 1)
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black group" style={{ aspectRatio: '16/9' }}>

      {/* YouTube player */}
      {videoType === 'youtube' && !isPiPActive && !videoError && (
        <iframe
          key={`${show.youtubeId}-${videoKey}`}
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={show.title}
          onError={() => setVideoError(true)}
        />
      )}

      {/* TikTok player */}
      {videoType === 'tiktok' && !isPiPActive && !videoError && (
        <iframe
          key={`tiktok-${videoKey}`}
          src={tiktokEmbedUrl}
          className="absolute inset-0 w-full h-full border-0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={show.title}
          onError={() => setVideoError(true)}
        />
      )}

      {/* Direct upload / hosted video file player */}
      {(videoType === 'upload' || videoType === 'direct') && !isPiPActive && !videoError && (
        <video
          key={`upload-${videoKey}`}
          src={show.videoUrl}
          className="absolute inset-0 w-full h-full object-contain bg-black"
          controls
          autoPlay={false}
          poster={show.thumbnailUrl}
          onError={() => setVideoError(true)}
        />
      )}

      {/* Error state */}
      {videoError && !isPiPActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${channel.color}15, #070710)` }}>
          <AlertCircle className="w-10 h-10 text-white/30 mb-3" />
          <div className="text-white/60 text-sm font-medium mb-1">Video unavailable</div>
          <div className="text-white/30 text-xs mb-4">This video may be restricted</div>
          <button onClick={handleRetry} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-all">
            Retry
          </button>
        </div>
      )}

      {/* PiP placeholder */}
      {isPiPActive && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${channel.color}22, #070710 60%)` }}>
          <div className="text-center">
            <div className="text-6xl mb-4">{channel.emoji}</div>
            <div className="text-white/60 text-sm">Playing in Picture-in-Picture</div>
            <button onClick={onPiP} className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-all">
              Return to main player
            </button>
          </div>
        </div>
      )}

      {/* Gradient overlays */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

      {/* Top bar: channel badge + live indicator */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold backdrop-blur-md"
          style={{ background: `${channel.color}30`, border: `1px solid ${channel.color}50`, boxShadow: `0 4px 20px ${channel.color}20` }}>
          <span>{channel.emoji}</span>
          <span>CH {channel.number} · {channel.name}</span>
          {show.isLive && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" />
              <span className="text-red-400 text-[9px] font-bold">LIVE</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onToggleFavorite}
            className={cn("w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all",
              isFavorite ? "bg-pink-500/80 text-white shadow-lg shadow-pink-500/30" : "bg-black/50 text-white/70 hover:text-white hover:bg-white/20 border border-white/10")}>
            <Heart className={cn("w-4 h-4", isFavorite && "fill-white")} />
          </button>
          <button onClick={onPiP}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-md text-white/70 hover:text-white hover:bg-white/20 border border-white/10 transition-all">
            <PictureInPicture2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom bar: title/meta + prev/next */}
      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
        <div className="pointer-events-none">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider text-white" style={{ background: channel.color }}>
              {show.category}
            </span>
            <span className="text-white/50 text-[10px] bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm font-mono">
              {show.duration}
            </span>
          </div>
          <div className="text-white font-bold text-base leading-tight drop-shadow-lg">{show.title}</div>
          {show.host && <div className="text-white/60 text-[10px] mt-0.5">with {show.host}</div>}
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={onPrevShow}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/25 transition-all border border-white/10">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={onNextShow}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/25 transition-all border border-white/10">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
