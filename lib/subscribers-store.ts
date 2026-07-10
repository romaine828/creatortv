import { kvGetAll, kvUpsert } from './kv-store'

export interface Subscriber {
  id: string
  name: string
  email: string
  channelId: string
  plan: 'free' | 'creator' | 'vip'
  subscribedAt: string
}

export async function getSubscribers(): Promise<Subscriber[]> {
  return kvGetAll<Subscriber>('subscribers')
}

export async function addSubscriber(info: Omit<Subscriber, 'id'>): Promise<Subscriber[]> {
  const list = await getSubscribers()
  const existing = list.find(s => s.email.toLowerCase() === info.email.toLowerCase() && s.channelId === info.channelId)
  const record: Subscriber = existing
    ? { ...existing, ...info }
    : { ...info, id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }
  await kvUpsert('subscribers', record.id, record)
  return getSubscribers()
}
