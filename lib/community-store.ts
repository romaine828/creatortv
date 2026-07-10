import { kvGetAll, kvUpsert, kvDelete } from './kv-store'

export interface CommunityPost {
  id: string; name: string; message: string; emoji: string
  timestamp: string; approved: boolean; pinned: boolean; reply?: string
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  return kvGetAll<CommunityPost>('community_posts')
}

export async function addCommunityPost(post: Omit<CommunityPost, 'id' | 'timestamp' | 'approved' | 'pinned'>): Promise<CommunityPost> {
  const newPost: CommunityPost = { ...post, id: `post-${Date.now()}`, timestamp: new Date().toISOString(), approved: false, pinned: false }
  await kvUpsert('community_posts', newPost.id, newPost)
  return newPost
}

export async function updateCommunityPost(id: string, updates: Partial<CommunityPost>): Promise<CommunityPost | null> {
  const posts = await getCommunityPosts()
  const idx = posts.findIndex(p => p.id === id)
  if (idx === -1) return null
  const updated = { ...posts[idx], ...updates }
  await kvUpsert('community_posts', id, updated)
  return updated
}

export async function deleteCommunityPost(id: string): Promise<void> {
  await kvDelete('community_posts', id)
}

export interface QAItem {
  id: string; question: string; name: string; timestamp: string
  answer?: string; answeredAt?: string; featured: boolean; category: string; email?: string
}

export async function getQAItems(): Promise<QAItem[]> {
  return kvGetAll<QAItem>('qa_items')
}

export async function addQAItem(item: Omit<QAItem, 'id' | 'timestamp' | 'featured'>): Promise<QAItem> {
  const newItem: QAItem = { ...item, id: `qa-${Date.now()}`, timestamp: new Date().toISOString(), featured: false }
  await kvUpsert('qa_items', newItem.id, newItem)
  return newItem
}

export async function updateQAItem(id: string, updates: Partial<QAItem>): Promise<QAItem | null> {
  const items = await getQAItems()
  const idx = items.findIndex(i => i.id === id)
  if (idx === -1) return null
  if (updates.answer && !items[idx].answeredAt) updates.answeredAt = new Date().toISOString()
  const updated = { ...items[idx], ...updates }
  await kvUpsert('qa_items', id, updated)
  return updated
}

export async function deleteQAItem(id: string): Promise<void> {
  await kvDelete('qa_items', id)
}
