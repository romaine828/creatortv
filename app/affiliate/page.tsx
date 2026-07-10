"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, DollarSign, Users, Link2, Copy, Check, Clock, Sparkles } from "lucide-react"

interface Referral {
  id: string
  tier: 'creator' | 'vip'
  subscriberEmail: string
  subscribedAt: string
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

export default function AffiliatePage() {
  const [view, setView] = useState<'apply' | 'lookup' | 'dashboard'>('apply')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [lookupEmail, setLookupEmail] = useState('')
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => { setOrigin(window.location.origin) }, [])

  const handleApply = async () => {
    setError('')
    if (!name.trim() || !email.trim()) { setError('Please fill in your name and email.'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/affiliates/apply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() })
      })
      const data = await res.json()
      setAffiliate(data)
      setView('dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLookup = async () => {
    setError('')
    if (!lookupEmail.trim()) { setError('Enter the email you applied with.'); return }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/affiliates/lookup?email=${encodeURIComponent(lookupEmail.trim())}`)
      if (!res.ok) { setError("We couldn't find an affiliate account with that email."); setSubmitting(false); return }
      const data = await res.json()
      setAffiliate(data)
      setView('dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const referralLink = affiliate ? `${origin}/?ref=${affiliate.code}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeReferrals = affiliate?.referrals.filter(r => r.active) || []
  const monthlyRecurring = activeReferrals.reduce((sum, r) => sum + r.monthlyCommission, 0)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#070710' }}>
      <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5" style={{ background: '#0a0a16' }}>
        <a href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-purple-400 border border-purple-500/30 hover:bg-purple-500/10 transition-all">
          <ArrowLeft className="w-3 h-3" /> Back to CreatorTV
        </a>
        <div className="text-white font-bold text-sm ml-2">💰 CreatorTV Affiliate Program</div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">

          {view === 'apply' && (
            <div className="rounded-2xl border border-purple-500/20 p-6" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08), #0e0e1c)' }}>
              <div className="text-center mb-6">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h1 className="text-2xl font-bold text-white mb-1">Become a CreatorTV Affiliate</h1>
                <p className="text-white/40 text-sm">Earn recurring commission every month for as long as your referral stays subscribed.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-xl p-3 border border-white/8 text-center" style={{ background: '#0c0c18' }}>
                  <div className="text-purple-300 font-bold text-lg">20%</div>
                  <div className="text-white/40 text-[10px]">Creator Pass referrals</div>
                </div>
                <div className="rounded-xl p-3 border border-yellow-500/20 text-center" style={{ background: '#0c0c18' }}>
                  <div className="text-yellow-300 font-bold text-lg">30%</div>
                  <div className="text-white/40 text-[10px]">VIP referrals</div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Your Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-purple-400/40" />
              </div>
              <div className="mb-4">
                <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Your Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-purple-400/40" />
              </div>

              {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

              <button onClick={handleApply} disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                {submitting ? 'Applying...' : 'Apply to Become an Affiliate'}
              </button>

              <p className="text-white/25 text-[10px] text-center mt-3">
                Applications are reviewed by the CreatorTV team. Already applied?{' '}
                <button onClick={() => { setView('lookup'); setError('') }} className="text-purple-300 hover:underline">Check your status →</button>
              </p>
            </div>
          )}

          {view === 'lookup' && (
            <div className="rounded-2xl border border-white/8 p-6" style={{ background: '#0e0e1c' }}>
              <h1 className="text-xl font-bold text-white mb-1">Check Your Affiliate Status</h1>
              <p className="text-white/40 text-sm mb-4">Enter the email you applied with.</p>
              <input value={lookupEmail} onChange={e => setLookupEmail(e.target.value)} placeholder="jane@example.com" type="email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-purple-400/40 mb-3" />
              {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
              <button onClick={handleLookup} disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                {submitting ? 'Looking up...' : 'View My Dashboard'}
              </button>
              <button onClick={() => { setView('apply'); setError('') }} className="w-full text-center text-white/30 text-xs mt-3 hover:text-white/60">← Back to apply</button>
            </div>
          )}

          {view === 'dashboard' && affiliate && (
            <div className="flex flex-col gap-4">

              {affiliate.status === 'pending' && (
                <div className="rounded-2xl border border-yellow-500/20 p-5 flex items-center gap-3" style={{ background: 'rgba(234,179,8,0.06)' }}>
                  <Clock className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                  <div>
                    <div className="text-white font-semibold text-sm">Application Pending Review</div>
                    <div className="text-white/40 text-xs">You'll be able to share your link once approved. Check back soon!</div>
                  </div>
                </div>
              )}

              {affiliate.status === 'rejected' && (
                <div className="rounded-2xl border border-red-500/20 p-5" style={{ background: 'rgba(239,68,68,0.06)' }}>
                  <div className="text-white font-semibold text-sm">Application Not Approved</div>
                  <div className="text-white/40 text-xs mt-1">Reach out to CreatorTV directly if you have questions.</div>
                </div>
              )}

              {affiliate.status === 'approved' && (
                <div className="rounded-2xl border border-green-500/20 p-5" style={{ background: 'rgba(16,185,129,0.06)' }}>
                  <div className="text-white font-semibold text-sm mb-3 flex items-center gap-1.5"><Link2 className="w-4 h-4 text-green-400" /> Your Referral Link</div>
                  <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2.5">
                    <code className="text-green-300 text-xs flex-1 truncate">{referralLink}</code>
                    <button onClick={copyLink} className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold flex items-center gap-1 transition-all">
                      {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <div className="text-white/30 text-[10px] mt-2">Code: <span className="text-white/60 font-mono">{affiliate.code}</span></div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-3 border border-white/8 text-center" style={{ background: '#0e0e1c' }}>
                  <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <div className="text-white font-bold text-lg">{affiliate.clicks}</div>
                  <div className="text-white/30 text-[9px] uppercase tracking-wider">Clicks</div>
                </div>
                <div className="rounded-xl p-3 border border-white/8 text-center" style={{ background: '#0e0e1c' }}>
                  <Sparkles className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <div className="text-white font-bold text-lg">{activeReferrals.length}</div>
                  <div className="text-white/30 text-[9px] uppercase tracking-wider">Active Referrals</div>
                </div>
                <div className="rounded-xl p-3 border border-white/8 text-center" style={{ background: '#0e0e1c' }}>
                  <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
                  <div className="text-white font-bold text-lg">${monthlyRecurring.toFixed(2)}</div>
                  <div className="text-white/30 text-[9px] uppercase tracking-wider">Per Month</div>
                </div>
              </div>

              <div className="rounded-xl p-4 border border-white/8" style={{ background: '#0e0e1c' }}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/50">Total Earned (lifetime)</span>
                  <span className="text-white font-bold">${affiliate.totalEarned.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Total Paid Out</span>
                  <span className="text-white font-bold">${affiliate.totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-white/5">
                  <span className="text-green-300 font-semibold">Balance Due</span>
                  <span className="text-green-300 font-bold">${(affiliate.totalEarned - affiliate.totalPaid).toFixed(2)}</span>
                </div>
              </div>

              {affiliate.referrals.length > 0 && (
                <div className="rounded-xl p-4 border border-white/8" style={{ background: '#0e0e1c' }}>
                  <div className="text-white font-semibold text-xs mb-3">Your Referrals</div>
                  <div className="flex flex-col gap-2">
                    {affiliate.referrals.map(r => (
                      <div key={r.id} className="flex items-center justify-between text-xs">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${r.tier === 'vip' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-purple-500/20 text-purple-300'}`}>{r.tier}</span>
                        <span className="text-white/40 flex-1 mx-2 truncate">{r.subscriberEmail}</span>
                        <span className="text-green-400 font-semibold">+${r.monthlyCommission.toFixed(2)}/mo</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
