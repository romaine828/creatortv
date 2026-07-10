"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  Users, MessageSquare, Star, Trash2, Pin, Reply,
  CheckCircle, Clock, HelpCircle, ThumbsUp, Eye, EyeOff,
  RefreshCw, Edit3, Send, ChevronDown, ChevronUp, Tv
} from "lucide-react"

interface CommunityPost {
  id: string
  name: string
  message: string
  emoji: string
  timestamp: string
  approved: boolean
  pinned: boolean
  reply?: string
}

interface QAItem {
  id: string
  question: string
  name: string
  timestamp: string
  answer?: string
  answeredAt?: string
  featured: boolean
  category: string
}

export function CommunityManager({ defaultTab = 'wall' }: { defaultTab?: 'wall' | 'qa' }) {
  const [tab, setTab] = useState<'wall' | 'qa'>(defaultTab as 'wall' | 'qa')
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [qaItems, setQaItems] = useState<QAItem[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [answeringId, setAnsweringId] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState('')
  const [editAnswerId, setEditAnswerId] = useState<string | null>(null)
  const [expandedQA, setExpandedQA] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [postsRes, qaRes] = await Promise.all([
        fetch('/api/community'),
        fetch('/api/qa'),
      ])
      setPosts(await postsRes.json())
      setQaItems(await qaRes.json())
    } catch (e) {
      console.error('Failed to load community data', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // --- Posts ---
  const approvePost = async (id: string, approved: boolean) => {
    await fetch('/api/community', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, approved }) })
    setPosts(p => p.map(x => x.id === id ? { ...x, approved } : x))
  }

  const pinPost = async (id: string, pinned: boolean) => {
    await fetch('/api/community', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, pinned }) })
    setPosts(p => p.map(x => x.id === id ? { ...x, pinned } : x))
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    await fetch('/api/community', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setPosts(p => p.filter(x => x.id !== id))
  }

  const saveReply = async (id: string) => {
    await fetch('/api/community', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, reply: replyText }) })
    setPosts(p => p.map(x => x.id === id ? { ...x, reply: replyText } : x))
    setReplyingTo(null)
    setReplyText('')
  }

  // --- Q&A ---
  const saveAnswer = async (id: string, answer: string) => {
    await fetch('/api/qa', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, answer }) })
    setQaItems(q => q.map(x => x.id === id ? { ...x, answer, answeredAt: new Date().toISOString() } : x))
    setAnsweringId(null)
    setAnswerText('')
    setEditAnswerId(null)
  }

  const toggleFeatured = async (id: string, featured: boolean) => {
    await fetch('/api/qa', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, featured }) })
    setQaItems(q => q.map(x => x.id === id ? { ...x, featured } : x))
  }

  const deleteQA = async (id: string) => {
    if (!confirm('Delete this question?')) return
    await fetch('/api/qa', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setQaItems(q => q.filter(x => x.id !== id))
  }

  const fmtTime = (ts: string) => {
    try { return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
    catch { return ts }
  }

  const pending = posts.filter(p => !p.approved)
  const approved = posts.filter(p => p.approved).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
  const unanswered = qaItems.filter(q => !q.answer)
  const answered = qaItems.filter(q => q.answer)

  return (
    <div className="flex flex-col h-full" style={{ background: '#0a0a16' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" /> Community Manager
            </h1>
            <p className="text-white/40 text-sm mt-0.5">Manage your viewer community wall &amp; Q&amp;A</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-2xl font-black text-purple-400">{posts.length}</div>
              <div className="text-[10px] text-white/40">Total Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-yellow-400">{pending.length}</div>
              <div className="text-[10px] text-white/40">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-cyan-400">{qaItems.length}</div>
              <div className="text-[10px] text-white/40">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-red-400">{unanswered.length}</div>
              <div className="text-[10px] text-white/40">Unanswered</div>
            </div>
            <button onClick={loadData} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <button onClick={() => setTab('wall')}
            className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
              tab === 'wall' ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-white/40 hover:text-white hover:bg-white/5")}>
            <MessageSquare className="w-4 h-4" />
            Fan Wall
            {pending.length > 0 && <span className="w-5 h-5 rounded-full bg-yellow-500 text-black text-[10px] font-bold flex items-center justify-center">{pending.length}</span>}
          </button>
          <button onClick={() => setTab('qa')}
            className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
              tab === 'qa' ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-white/40 hover:text-white hover:bg-white/5")}>
            <HelpCircle className="w-4 h-4" />
            Q&amp;A
            {unanswered.length > 0 && <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unanswered.length}</span>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/30">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
          </div>
        ) : tab === 'wall' ? (
          <>
            {/* Pending */}
            {pending.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Pending Approval ({pending.length})
                </h2>
                <div className="space-y-2">
                  {pending.map(p => (
                    <div key={p.id} className="rounded-xl p-4 border border-yellow-500/20 bg-yellow-500/5">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{p.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-sm">{p.name}</span>
                            <span className="text-white/30 text-[10px]">{fmtTime(p.timestamp)}</span>
                          </div>
                          <p className="text-white/70 text-sm mt-1">{p.message}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => approvePost(p.id, true)}
                            className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/30 transition-colors flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Approve
                          </button>
                          <button onClick={() => deletePost(p.id)}
                            className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved */}
            <div>
              <h2 className="text-sm font-semibold text-white/50 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" /> Approved ({approved.length})
              </h2>
              {approved.length === 0 ? (
                <div className="text-center py-10 text-white/20 text-sm">No approved posts yet</div>
              ) : (
                <div className="space-y-2">
                  {approved.map(p => (
                    <div key={p.id} className={cn("rounded-xl p-4 border transition-all", p.pinned ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/8 bg-white/3")}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{p.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-sm">{p.name}</span>
                            {p.pinned && <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold">📌 PINNED</span>}
                            <span className="text-white/30 text-[10px]">{fmtTime(p.timestamp)}</span>
                          </div>
                          <p className="text-white/70 text-sm mt-1">{p.message}</p>
                          {p.reply && (
                            <div className="mt-2 pl-3 border-l-2 border-purple-500/40">
                              <div className="flex items-center gap-1 mb-1">
                                <Tv className="w-3 h-3 text-purple-400" />
                                <span className="text-[10px] font-semibold text-purple-400">Creator Reply</span>
                              </div>
                              <p className="text-white/60 text-xs">{p.reply}</p>
                            </div>
                          )}
                          {replyingTo === p.id && (
                            <div className="mt-3 flex gap-2">
                              <input value={replyText} onChange={e => setReplyText(e.target.value)}
                                placeholder="Write a reply…"
                                className="flex-1 bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-purple-500/50" />
                              <button onClick={() => saveReply(p.id)}
                                className="px-3 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors">
                                <Send className="w-4 h-4" />
                              </button>
                              <button onClick={() => { setReplyingTo(null); setReplyText('') }}
                                className="px-3 py-2 rounded-lg text-white/30 hover:text-white transition-colors text-sm">Cancel</button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => { setReplyingTo(replyingTo === p.id ? null : p.id); setReplyText(p.reply || '') }}
                            className="p-1.5 rounded-lg text-purple-400/60 hover:text-purple-400 hover:bg-purple-500/10 transition-colors" title="Reply">
                            <Reply className="w-4 h-4" />
                          </button>
                          <button onClick={() => pinPost(p.id, !p.pinned)}
                            className={cn("p-1.5 rounded-lg transition-colors", p.pinned ? "text-yellow-400 bg-yellow-500/15" : "text-white/30 hover:text-yellow-400 hover:bg-yellow-500/10")} title="Pin">
                            <Pin className="w-4 h-4" />
                          </button>
                          <button onClick={() => approvePost(p.id, false)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-orange-400 hover:bg-orange-500/10 transition-colors" title="Hide">
                            <EyeOff className="w-4 h-4" />
                          </button>
                          <button onClick={() => deletePost(p.id)}
                            className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Unanswered */}
            {unanswered.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> Needs Answer ({unanswered.length})
                </h2>
                <div className="space-y-2">
                  {unanswered.map(q => (
                    <div key={q.id} className="rounded-xl p-4 border border-red-500/20 bg-red-500/5">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold text-sm">{q.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/40 font-medium capitalize">{q.category}</span>
                            <span className="text-white/30 text-[10px]">{fmtTime(q.timestamp)}</span>
                          </div>
                          <p className="text-white/80 text-sm font-medium">{q.question}</p>
                          {answeringId === q.id ? (
                            <div className="mt-3 space-y-2">
                              <textarea value={answerText} onChange={e => setAnswerText(e.target.value)}
                                rows={3} placeholder="Write your answer…"
                                className="w-full bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-cyan-500/50 resize-none" />
                              <div className="flex gap-2">
                                <button onClick={() => saveAnswer(q.id, answerText)}
                                  disabled={!answerText.trim()}
                                  className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/30 transition-colors disabled:opacity-40 flex items-center gap-1">
                                  <Send className="w-3.5 h-3.5" /> Publish Answer
                                </button>
                                <button onClick={() => { setAnsweringId(null); setAnswerText('') }}
                                  className="px-4 py-2 rounded-lg text-white/30 hover:text-white transition-colors text-sm">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => { setAnsweringId(q.id); setAnswerText('') }}
                              className="mt-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition-colors flex items-center gap-1">
                              <Edit3 className="w-3 h-3" /> Answer This
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => toggleFeatured(q.id, !q.featured)}
                            className={cn("p-1.5 rounded-lg transition-colors", q.featured ? "text-yellow-400 bg-yellow-500/15" : "text-white/30 hover:text-yellow-400 hover:bg-yellow-500/10")} title="Feature">
                            <Star className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteQA(q.id)}
                            className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Answered */}
            <div>
              <h2 className="text-sm font-semibold text-white/50 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" /> Answered ({answered.length})
              </h2>
              {answered.length === 0 ? (
                <div className="text-center py-10 text-white/20 text-sm">No answered questions yet</div>
              ) : (
                <div className="space-y-2">
                  {answered.map(q => (
                    <div key={q.id} className={cn("rounded-xl border transition-all", q.featured ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/8 bg-white/3")}>
                      <button onClick={() => setExpandedQA(expandedQA === q.id ? null : q.id)}
                        className="w-full flex items-start gap-3 p-4 text-left">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white/60 font-semibold text-xs">{q.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/40 font-medium capitalize">{q.category}</span>
                            {q.featured && <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold">⭐ FEATURED</span>}
                          </div>
                          <p className="text-white text-sm font-medium">{q.question}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={e => { e.stopPropagation(); toggleFeatured(q.id, !q.featured) }}
                            className={cn("p-1.5 rounded-lg transition-colors", q.featured ? "text-yellow-400 bg-yellow-500/15" : "text-white/20 hover:text-yellow-400 hover:bg-yellow-500/10")} title="Feature">
                            <Star className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); setEditAnswerId(q.id); setAnswerText(q.answer || ''); setExpandedQA(q.id) }}
                            className="p-1.5 rounded-lg text-white/20 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors" title="Edit answer">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); deleteQA(q.id) }}
                            className="p-1.5 rounded-lg text-red-400/30 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {expandedQA === q.id ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                        </div>
                      </button>
                      {expandedQA === q.id && (
                        <div className="px-4 pb-4">
                          <div className="pl-3 border-l-2 border-purple-500/40">
                            <div className="flex items-center gap-1 mb-1">
                              <Tv className="w-3 h-3 text-purple-400" />
                              <span className="text-[10px] font-semibold text-purple-400">Creator Answer</span>
                            </div>
                            {editAnswerId === q.id ? (
                              <div className="space-y-2">
                                <textarea value={answerText} onChange={e => setAnswerText(e.target.value)}
                                  rows={3}
                                  className="w-full bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500/50 resize-none" />
                                <div className="flex gap-2">
                                  <button onClick={() => saveAnswer(q.id, answerText)}
                                    className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-semibold hover:bg-purple-500/30 transition-colors">
                                    Save
                                  </button>
                                  <button onClick={() => { setEditAnswerId(null); setAnswerText('') }}
                                    className="px-4 py-2 rounded-lg text-white/30 hover:text-white transition-colors text-sm">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-white/60 text-sm">{q.answer}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
