import { kvGetAll, kvUpsert, kvDelete } from './kv-store'

export interface ExclusiveItem {
  id: string
  emoji: string
  title: string
  description: string
  url: string
  buttonLabel: string
  createdAt: string
}

export async function getExclusiveItems(): Promise<ExclusiveItem[]> {
  return kvGetAll<ExclusiveItem>('exclusive_content')
}

export async function addExclusiveItem(item: Omit<ExclusiveItem, 'id' | 'createdAt'>): Promise<ExclusiveItem[]> {
  const newItem: ExclusiveItem = { ...item, id: `ex_${Date.now()}`, createdAt: new Date().toISOString() }
  await kvUpsert('exclusive_content', newItem.id, newItem)
  return getExclusiveItems()
}

export async function updateExclusiveItem(id: string, updates: Partial<ExclusiveItem>): Promise<ExclusiveItem[]> {
  const items = await getExclusiveItems()
  const idx = items.findIndex(i => i.id === id)
  if (idx >= 0) {
    const updated = { ...items[idx], ...updates }
    await kvUpsert('exclusive_content', id, updated)
  }
  return getExclusiveItems()
}

export async function deleteExclusiveItem(id: string): Promise<ExclusiveItem[]> {
  await kvDelete('exclusive_content', id)
  return getExclusiveItems()
}
