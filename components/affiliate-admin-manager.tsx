"use client"

import { useState, useEffect } from "react"
import { Check, X, DollarSign, Users, TrendingUp, Clock } from "lucide-react"

interface Referral {
  id: string
  tier: 'creator' | 'vip'
  subscriberEmail: string
  monthlyCommission: number
  active: boolean
}

interface Affiliate {
  id: string
  name: string
  email: string
  code: string
  status: 'pending' | 'approved' | 'rejected'
  clicks: number
  referrals: Referral[]
  totalEarned: number
  totalPaid: number
}

export function AffiliateAdminManager() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [payoutInput, setPayoutInput] = useState<Record<string, string>>({})

  const load = () => {
    fetch('/api/affiliates').then(r => r.json()).then(data => {
      setAffiliates(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const setStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    await fetch('/api/affiliates/action', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
    load()
  }

  const markPaid = async (id: string) => {
    const amount = parseFloat(payoutInput[id] || '0')
    if (!amount || amount <= 0) { alert('Enter a valid payout amount'); return }
    await fetch('/api/affiliates/payout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, amount })
    })
    setPayoutInput(prev => ({ ...prev, [id]: '' }))
    load()
  }

  const pending = affiliates.filter(a => a.status === 'pending')
  const approved = affiliates.filter(a => a.status === 'approved')
  const totalOwed = affiliates.reduce((sum, a) => sum + (a.totalEarned - a.totalPaid), 0)

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-400" /> Affiliate Program
        </h1>
        <p className="text-white/40 text-sm">Review applications, track referrals, and manage payouts. 20% commission on Creator Pass, 30% on VIP — recurring monthly for as long as the referral stays subscribed.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl p-3 border border-white/8 text-center" style={{ background: '#0e0e1c' }}>
          <div className="text-white font-bold text-lg">{affiliates.length}</div>
          <div className="text-white/30 text-[9px] uppercase tracking-wider">Total Affiliates</div>
        </div>
        <div className="rounded-xl p-3 border border-yellow-500/20 text-center" style={{ background: '#0e0e1c' }}>
          <div className="text-yellow-300 font-bold text-lg">{pending.length}</div>
          <div className="text-white/30 text-[9px] uppercase tracking-wider">Pending Review</div>
        </div>
        <div className="rounded-xl p-3 border border-green-500/20 text-center" style={{ background: '#0e0e1c' }}>
          <div className="text-green-300 font-bold text-lg">${totalOwed.toFixed(2)}</div>
          <div className="text-white/30 text-[9px] uppercase tracking-wider">Total Owed</div>
        </div>
      </div>

      {loading ? (
        <div className="text-white/30 text-sm text-center py-8">Loading...</div>
      ) : affiliates.length === 0 ? (
        <div className="text-white/30 text-sm text-center py-8 rounded-xl border border-white/8">
          No affiliate applications yet. Share <code className="text-purple-300">/affiliate</code> with people who want to promote CreatorTV!
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pending.length > 0 && (
            <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mt-2">Pending Applications</div>
          )}
          {pending.map(a => (
            <div key={a.id} className="rounded-xl p-4 border border-yellow-500/20 flex items-center gap-3" style={{ background: 'rgba(234,179,8,0.04)' }}>
              <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold">{a.name}</div>
                <div className="text-white/40 text-xs">{a.email}</div>
              </div>
              <button onClick={() => setStatus(a.id, 'approved')}
                className="px-3 py-1.5 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-300 text-xs font-semibold flex items-center gap-1 transition-all">
                <Check className="w-3 h-3" /> Approve
              </button>
              <button onClick={() => setStatus(a.id, 'rejected')}
                className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-semibold flex items-center gap-1 transition-all">
                <X className="w-3 h-3" /> Reject
              </button>
            </div>
          ))}

          {approved.length > 0 && (
            <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mt-4">Approved Affiliates</div>
          )}
          {approved.map(a => {
            const owed = a.totalEarned - a.totalPaid
            const activeCount = a.referrals.filter(r => r.active).length
            return (
              <div key={a.id} className="rounded-xl p-4 border border-white/8" style={{ background: '#0e0e1c' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-300 font-bold text-sm flex-shrink-0">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold">{a.name}</div>
                    <div className="text-white/40 text-xs">{a.email} · code <span className="font-mono text-white/60">{a.code}</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center mb-3">
                  <div>
                    <div className="text-white font-bold text-sm">{a.clicks}</div>
                    <div className="text-white/30 text-[9px] uppercase">Clicks</div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{activeCount}</div>
                    <div className="text-white/30 text-[9px] uppercase">Active</div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">${a.totalEarned.toFixed(2)}</div>
                    <div className="text-white/30 text-[9px] uppercase">Earned</div>
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${owed > 0 ? 'text-green-300' : 'text-white'}`}>${owed.toFixed(2)}</div>
                    <div className="text-white/30 text-[9px] uppercase">Owed</div>
                  </div>
                </div>
                {owed > 0 && (
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder={`Amount (up to $${owed.toFixed(2)})`}
                      value={payoutInput[a.id] || ''}
                      onChange={e => setPayoutInput(prev => ({ ...prev, [a.id]: e.target.value }))}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder-white/20 outline-none focus:border-green-400/40" />
                    <button onClick={() => markPaid(a.id)}
                      className="px-3 py-1.5 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-300 text-xs font-semibold flex items-center gap-1 transition-all flex-shrink-0">
                      <DollarSign className="w-3 h-3" /> Mark Paid
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 rounded-xl p-4 border border-purple-500/15 text-[11px] text-white/40 leading-relaxed" style={{ background: 'rgba(168,85,247,0.04)' }}>
        <strong className="text-purple-300/70">💡 Share this:</strong> Send people to <code className="text-white/60">/affiliate</code> to apply. Once approved, their unique link (<code className="text-white/60">yoursite.com/?ref=CODE</code>) tracks clicks and referrals automatically — commission is calculated the moment someone subscribes.
      </div>
    </div>
  )
}
