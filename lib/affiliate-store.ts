import { kvGetAll, kvUpsert } from './kv-store'

export type AffiliateStatus = 'pending' | 'approved' | 'rejected'
export type ReferralTier = 'creator' | 'vip'

export interface Referral {
  id: string
  tier: ReferralTier
  subscriberEmail: string
  subscribedAt: string
  monthlyCommission: number
  active: boolean
}

export interface Affiliate {
  id: string
  name: string
  email: string
  code: string
  status: AffiliateStatus
  createdAt: string
  clicks: number
  referrals: Referral[]
  totalEarned: number
  totalPaid: number
}

export const COMMISSION_RATES: Record<ReferralTier, number> = {
  creator: 0.20,
  vip: 0.30,
}

export const PLAN_PRICES: Record<ReferralTier, number> = {
  creator: 9.99,
  vip: 19.99,
}

export async function getAffiliates(): Promise<Affiliate[]> {
  return kvGetAll<Affiliate>('affiliates')
}

function generateCode(name: string): string {
  const base = name.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8) || 'FAN'
  const suffix = Math.floor(10 + Math.random() * 90)
  return `${base}${suffix}`
}

export async function applyAsAffiliate(name: string, email: string): Promise<Affiliate> {
  const list = await getAffiliates()
  const existing = list.find(a => a.email.toLowerCase() === email.toLowerCase())
  if (existing) return existing

  let code = generateCode(name)
  while (list.some(a => a.code === code)) code = generateCode(name)

  const affiliate: Affiliate = {
    id: `aff_${Date.now()}`,
    name, email, code,
    status: 'pending',
    createdAt: new Date().toISOString(),
    clicks: 0, referrals: [], totalEarned: 0, totalPaid: 0,
  }
  await kvUpsert('affiliates', affiliate.id, affiliate)
  return affiliate
}

export async function getAffiliateByCode(code: string): Promise<Affiliate | undefined> {
  return (await getAffiliates()).find(a => a.code.toUpperCase() === code.toUpperCase())
}

export async function getAffiliateByEmail(email: string): Promise<Affiliate | undefined> {
  return (await getAffiliates()).find(a => a.email.toLowerCase() === email.toLowerCase())
}

export async function updateAffiliateStatus(id: string, status: AffiliateStatus): Promise<Affiliate[]> {
  const list = await getAffiliates()
  const idx = list.findIndex(a => a.id === id)
  if (idx >= 0) {
    list[idx].status = status
    await kvUpsert('affiliates', id, list[idx])
  }
  return getAffiliates()
}

export async function recordPayout(id: string, amount: number): Promise<Affiliate[]> {
  const list = await getAffiliates()
  const idx = list.findIndex(a => a.id === id)
  if (idx >= 0) {
    list[idx].totalPaid += amount
    await kvUpsert('affiliates', id, list[idx])
  }
  return getAffiliates()
}

export async function trackClick(code: string): Promise<void> {
  const list = await getAffiliates()
  const idx = list.findIndex(a => a.code.toUpperCase() === code.toUpperCase())
  if (idx >= 0) {
    list[idx].clicks += 1
    await kvUpsert('affiliates', list[idx].id, list[idx])
  }
}

export async function recordConversion(code: string, tier: ReferralTier, subscriberEmail: string): Promise<Affiliate | null> {
  const list = await getAffiliates()
  const idx = list.findIndex(a => a.code.toUpperCase() === code.toUpperCase())
  if (idx < 0) return null
  const affiliate = list[idx]
  if (affiliate.status !== 'approved') return null

  const monthlyCommission = Math.round(PLAN_PRICES[tier] * COMMISSION_RATES[tier] * 100) / 100
  const referral: Referral = {
    id: `ref_${Date.now()}`, tier, subscriberEmail,
    subscribedAt: new Date().toISOString(), monthlyCommission, active: true,
  }
  affiliate.referrals.push(referral)
  affiliate.totalEarned = Math.round((affiliate.totalEarned + monthlyCommission) * 100) / 100
  await kvUpsert('affiliates', affiliate.id, affiliate)
  return affiliate
}
