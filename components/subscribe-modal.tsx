"use client"

import { useState } from "react"
import { Channel } from "@/lib/tv-data"
import { cn } from "@/lib/utils"
import { X, Check, Zap, Crown, Shield, Play, User, Mail, ArrowRight } from "lucide-react"

interface Plan {
  id: 'free' | 'creator' | 'vip'
  name: string
  price: string
  period: string
  color: string
  badge?: string
  description: string
  features: string[]
  icon: React.ReactNode
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: '#10b981',
    description: 'Watch all channels for free',
    icon: <Play className="w-5 h-5" />,
    features: [
      'Watch ALL channels — unlimited',
      'All shows, no daily cap',
      'Standard video quality',
      'Community chat access',
      'New episode notifications',
    ]
  },
  {
    id: 'creator',
    name: 'Creator Pass',
    price: '$9.99',
    period: '/month',
    color: '#a855f7',
    badge: 'POPULAR',
    description: 'For serious fans & learners',
    icon: <Zap className="w-5 h-5" />,
    features: [
      'Everything in Free',
      'HD & 4K streaming',
      'Ad-free experience',
      'Exclusive creator content',
      'Early access to new shows',
      'Downloadable resources',
      'Monthly Creator Q&A sessions',
      'Support the creator directly',
    ]
  },
  {
    id: 'vip',
    name: 'VIP All-Access',
    price: '$19.99',
    period: '/month',
    color: '#f59e0b',
    badge: 'BEST VALUE',
    description: 'The ultimate experience',
    icon: <Crown className="w-5 h-5" />,
    features: [
      'Everything in Creator Pass',
      'VIP badge on your profile',
      'Direct message the creator',
      'Join live show recordings',
      'Monthly 1-on-1 coaching call',
      'Launch YOUR own channel FREE',
      'Channel analytics dashboard',
      'Priority support',
    ]
  }
]

interface SubscriberInfo {
  name: string
  email: string
  channelId: string
  plan: string
  subscribedAt: string
}

function saveSubscriberToLocalStorage(info: SubscriberInfo) {
  try {
    const key = 'creatortv_subscribers'
    const existing: SubscriberInfo[] = JSON.parse(localStorage.getItem(key) || '[]')
    // Update if already subscribed to this channel, otherwise add
    const idx = existing.findIndex(s => s.email === info.email && s.channelId === info.channelId)
    if (idx >= 0) {
      existing[idx] = info
    } else {
      existing.push(info)
    }
    localStorage.setItem(key, JSON.stringify(existing))
  } catch {
    // localStorage unavailable — silently skip
  }
}

interface SubscribeModalProps {
  channel: Channel
  currentPlan: 'none' | 'free' | 'creator' | 'vip'
  onSubscribe: (plan: 'free' | 'creator' | 'vip') => void
  onClose: () => void
}

export function SubscribeModal({ channel, currentPlan, onSubscribe, onClose }: SubscribeModalProps) {
  const [selected, setSelected] = useState<'free' | 'creator' | 'vip'>('creator')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  // Subscriber info form
  const [step, setStep] = useState<'plans' | 'info' | 'processing' | 'success'>('plans')
  const [subName, setSubName] = useState('')
  const [subEmail, setSubEmail] = useState('')
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')

  const getPrice = (plan: Plan) => {
    if (plan.id === 'free') return '$0'
    const monthly = parseFloat(plan.price.replace('$', ''))
    if (billingCycle === 'annual') return `$${(monthly * 0.8).toFixed(2)}`
    return plan.price
  }

  const selectedPlan = PLANS.find(p => p.id === selected)!

  const handleProceedToInfo = () => {
    if (currentPlan === selected) return
    setStep('info')
  }

  const validateInfo = () => {
    let valid = true
    if (!subName.trim()) { setNameError('Please enter your full name'); valid = false }
    else setNameError('')
    if (!subEmail.trim()) { setEmailError('Please enter your email'); valid = false }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subEmail.trim())) { setEmailError('Please enter a valid email address'); valid = false }
    else setEmailError('')
    return valid
  }

  const handleSubscribe = async () => {
    if (!validateInfo()) return
    setStep('processing')
    await new Promise(r => setTimeout(r, 1500))
    // Save subscriber info (local for instant UX + server so the creator can see/notify subscribers)
    saveSubscriberToLocalStorage({
      name: subName.trim(),
      email: subEmail.trim(),
      channelId: channel.id,
      plan: selected,
      subscribedAt: new Date().toISOString(),
    })
    try {
      await fetch('/api/subscribers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: subName.trim(), email: subEmail.trim(), channelId: channel.id, plan: selected })
      })
    } catch {}
    // Affiliate conversion tracking — if this visitor came via a referral link
    if (selected === 'creator' || selected === 'vip') {
      try {
        const refCode = typeof window !== 'undefined' ? localStorage.getItem('creatortv_ref_code') : null
        if (refCode) {
          await fetch('/api/affiliates/convert', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: refCode, tier: selected, subscriberEmail: subEmail.trim() })
          })
        }
      } catch {}
    }
    setStep('success')
    await new Promise(r => setTimeout(r, 1200))
    onSubscribe(selected)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#0e0e1c', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/5"
          style={{ background: `linear-gradient(135deg, ${channel.color}20, transparent)` }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">{channel.emoji}</div>
            <div>
              <div className="text-white font-bold text-lg">Subscribe to {channel.name}</div>
              <div className="text-white/40 text-sm">{channel.tagline}</div>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-3">
            <div className={cn("flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all",
              step === 'plans' ? "bg-white/15 text-white" : "text-white/30")}>
              <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black",
                step === 'plans' ? "bg-white text-black" : "bg-white/20 text-white/40")}>1</span>
              Choose Plan
            </div>
            <div className="w-4 h-px bg-white/15" />
            <div className={cn("flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all",
              step === 'info' || step === 'processing' || step === 'success' ? "bg-white/15 text-white" : "text-white/30")}>
              <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black",
                step === 'info' || step === 'processing' || step === 'success' ? "bg-white text-black" : "bg-white/20 text-white/40")}>2</span>
              Your Info
            </div>

            {/* Billing toggle — only on plans step */}
            {step === 'plans' && (
              <div className="flex items-center gap-3 ml-auto">
                <span className={cn("text-sm transition-colors", billingCycle === 'monthly' ? 'text-white font-semibold' : 'text-white/40')}>Monthly</span>
                <button
                  onClick={() => setBillingCycle(b => b === 'monthly' ? 'annual' : 'monthly')}
                  className={cn("relative w-12 h-6 rounded-full transition-all", billingCycle === 'annual' ? 'bg-purple-500' : 'bg-white/15')}
                >
                  <span className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm", billingCycle === 'annual' ? 'left-7' : 'left-1')} />
                </button>
                <span className={cn("text-sm transition-colors", billingCycle === 'annual' ? 'text-white font-semibold' : 'text-white/40')}>
                  Annual
                  <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">SAVE 20%</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── STEP 1: Plans ── */}
        {step === 'plans' && (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-3 mb-6">
              {PLANS.map(plan => {
                const isSelected = selected === plan.id
                const isCurrent = currentPlan === plan.id
                return (
                  <button key={plan.id} onClick={() => setSelected(plan.id)}
                    className={cn("relative rounded-xl p-4 text-left transition-all border",
                      isSelected ? "border-opacity-70" : "border-white/8 hover:border-white/20")}
                    style={{
                      background: isSelected ? `linear-gradient(135deg, ${plan.color}20, ${plan.color}08)` : '#12121e',
                      borderColor: isSelected ? plan.color : undefined,
                      boxShadow: isSelected ? `0 0 30px ${plan.color}20` : 'none'
                    }}>

                    {plan.badge && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black text-white whitespace-nowrap"
                        style={{ background: plan.color }}>{plan.badge}</div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold text-white bg-green-500">CURRENT</div>
                    )}

                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 text-white" style={{ background: `${plan.color}25` }}>
                      <span style={{ color: plan.color }}>{plan.icon}</span>
                    </div>

                    <div className="text-white font-bold text-sm mb-0.5">{plan.name}</div>
                    <div className="text-white/40 text-[10px] mb-2">{plan.description}</div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">{getPrice(plan)}</span>
                      {plan.id !== 'free' && (
                        <span className="text-white/40 text-xs">{billingCycle === 'annual' ? '/mo billed annually' : plan.period}</span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {plan.features.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                          <span className="text-white/60 text-[10px] leading-tight">{f}</span>
                        </div>
                      ))}
                      {plan.features.length > 4 && (
                        <div className="text-[10px]" style={{ color: plan.color }}>+{plan.features.length - 4} more benefits</div>
                      )}
                    </div>

                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: plan.color }}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleProceedToInfo}
              disabled={currentPlan === selected}
              className={cn("w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                currentPlan === selected ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 active:scale-[0.98]")}
              style={{
                background: `linear-gradient(135deg, ${selectedPlan.color}, #ec4899)`,
                color: 'white',
                boxShadow: `0 0 30px ${selectedPlan.color}50`
              }}
            >
              {currentPlan === selected ? (
                <><Shield className="w-4 h-4" /> Already on this plan</>
              ) : selected === 'free' ? (
                <><ArrowRight className="w-4 h-4" /> Continue — Enter Your Info</>
              ) : (
                <><ArrowRight className="w-4 h-4" /> Continue — {getPrice(selectedPlan)}{billingCycle === 'annual' ? '/mo' : '/month'}</>
              )}
            </button>

            <p className="text-center text-white/25 text-[10px] mt-3">
              {selected === 'free' ? 'No credit card required · Cancel anytime' : '🔒 Secure checkout · Cancel anytime · 30-day money-back guarantee'}
            </p>
          </div>
        )}

        {/* ── STEP 2: Subscriber Info ── */}
        {step === 'info' && (
          <div className="p-6">
            {/* Selected plan summary */}
            <div className="flex items-center gap-3 p-3 rounded-xl mb-5"
              style={{ background: `${selectedPlan.color}15`, border: `1px solid ${selectedPlan.color}30` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${selectedPlan.color}25` }}>
                <span style={{ color: selectedPlan.color }}>{selectedPlan.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm">{selectedPlan.name}</div>
                <div className="text-white/40 text-xs">{selectedPlan.description}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-black text-white">{getPrice(selectedPlan)}</div>
                {selected !== 'free' && <div className="text-white/30 text-[10px]">{billingCycle === 'annual' ? '/mo annually' : selectedPlan.period}</div>}
              </div>
              <button onClick={() => setStep('plans')} className="text-white/30 hover:text-white/60 text-[10px] ml-1 flex-shrink-0">Change</button>
            </div>

            {/* Info form */}
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-white/60 text-xs font-semibold mb-1.5">
                  <User className="w-3 h-3 inline mr-1" />Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={subName}
                  onChange={e => { setSubName(e.target.value); setNameError('') }}
                  placeholder="Jane Smith"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/25 outline-none transition-all",
                    "bg-white/5 border",
                    nameError ? "border-red-500/60 focus:border-red-400" : "border-white/10 focus:border-white/30"
                  )}
                />
                {nameError && <p className="text-red-400 text-[10px] mt-1">{nameError}</p>}
              </div>

              <div>
                <label className="block text-white/60 text-xs font-semibold mb-1.5">
                  <Mail className="w-3 h-3 inline mr-1" />Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={subEmail}
                  onChange={e => { setSubEmail(e.target.value); setEmailError('') }}
                  placeholder="jane@example.com"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/25 outline-none transition-all",
                    "bg-white/5 border",
                    emailError ? "border-red-500/60 focus:border-red-400" : "border-white/10 focus:border-white/30"
                  )}
                />
                {emailError && <p className="text-red-400 text-[10px] mt-1">{emailError}</p>}
              </div>

              <p className="text-white/25 text-[10px] leading-relaxed">
                📬 Your info is saved locally on your device. The channel creator will be able to see subscriber details. We never share your data.
              </p>
            </div>

            <button
              onClick={handleSubscribe}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${selectedPlan.color}, #ec4899)`,
                color: 'white',
                boxShadow: `0 0 30px ${selectedPlan.color}50`
              }}
            >
              {selected === 'free' ? (
                <><Play className="w-4 h-4" /> Subscribe Free — Watch Everything Now</>
              ) : (
                <><Crown className="w-4 h-4" /> Subscribe — {getPrice(selectedPlan)}{billingCycle === 'annual' ? '/mo' : selectedPlan.period}</>
              )}
            </button>

            <p className="text-center text-white/25 text-[10px] mt-3">
              {selected === 'free' ? 'No credit card required · Cancel anytime' : '🔒 Secure checkout · Cancel anytime · 30-day money-back guarantee'}
            </p>
          </div>
        )}

        {/* ── STEP 3: Processing / Success ── */}
        {(step === 'processing' || step === 'success') && (
          <div className="p-10 flex flex-col items-center justify-center text-center min-h-[220px]">
            {step === 'processing' ? (
              <>
                <span className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin mb-4" />
                <div className="text-white font-semibold">Setting up your subscription…</div>
                <div className="text-white/40 text-sm mt-1">Just a moment</div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 40px rgba(16,185,129,0.4)' }}>
                  <Check className="w-8 h-8 text-white" />
                </div>
                <div className="text-white font-bold text-xl mb-1">You're subscribed! 🎉</div>
                <div className="text-white/50 text-sm">Welcome to {channel.name}, {subName.split(' ')[0]}!</div>
                <div className="mt-2 px-4 py-2 rounded-full text-xs font-bold text-white"
                  style={{ background: `${selectedPlan.color}25`, border: `1px solid ${selectedPlan.color}40`, color: selectedPlan.color }}>
                  {selectedPlan.name} plan activated
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
