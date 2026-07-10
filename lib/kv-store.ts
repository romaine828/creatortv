import { supabaseAdmin } from './supabase'

// Generic helpers for our simple (id TEXT PRIMARY KEY, data JSONB) tables.
// Every "store" file in /lib uses these instead of fs.readFileSync/writeFileSync.

export async function kvGetAll<T>(table: string): Promise<T[]> {
  const { data, error } = await supabaseAdmin.from(table).select('id, data')
  if (error) { console.error(`kvGetAll(${table})`, error); return [] }
  return (data || []).map((row: any) => row.data as T)
}

export async function kvGetOne<T>(table: string, id: string): Promise<T | null> {
  const { data, error } = await supabaseAdmin.from(table).select('data').eq('id', id).maybeSingle()
  if (error || !data) return null
  return data.data as T
}

export async function kvUpsert<T>(table: string, id: string, value: T): Promise<T> {
  const { error } = await supabaseAdmin.from(table).upsert({ id, data: value })
  if (error) console.error(`kvUpsert(${table})`, error)
  return value
}

export async function kvDelete(table: string, id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from(table).delete().eq('id', id)
  return !error
}

export async function kvUpsertMany<T extends { id: string }>(table: string, items: T[]): Promise<T[]> {
  if (items.length === 0) return items
  const rows = items.map(item => ({ id: item.id, data: item }))
  const { error } = await supabaseAdmin.from(table).upsert(rows)
  if (error) console.error(`kvUpsertMany(${table})`, error)
  return items
}

export async function kvReplaceAll<T extends { id: string }>(table: string, items: T[]): Promise<T[]> {
  // Full-replace semantics (used for lists like "channels" saved as a whole array)
  const { data: existing } = await supabaseAdmin.from(table).select('id')
  const existingIds = new Set((existing || []).map((r: any) => r.id))
  const newIds = new Set(items.map(i => i.id))
  const toDelete = [...existingIds].filter(id => !newIds.has(id))
  if (toDelete.length > 0) {
    await supabaseAdmin.from(table).delete().in('id', toDelete)
  }
  if (items.length > 0) {
    await kvUpsertMany(table, items)
  }
  return items
}
