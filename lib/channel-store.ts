import { CHANNELS, Channel } from './tv-data'
import { kvGetAll, kvReplaceAll, kvUpsert } from './kv-store'

export async function getChannels(): Promise<Channel[]> {
  const channels = await kvGetAll<Channel>('channels')
  if (channels.length > 0) return channels
  // First time: seed with defaults
  await kvReplaceAll('channels', CHANNELS)
  return CHANNELS
}

export async function saveChannels(channels: Channel[]): Promise<Channel[]> {
  return kvReplaceAll('channels', channels)
}

export async function saveChannel(updated: Channel): Promise<Channel[]> {
  await kvUpsert('channels', updated.id, updated)
  return getChannels()
}

export async function deleteChannel(id: string): Promise<Channel[]> {
  const channels = (await getChannels()).filter(c => c.id !== id)
  return saveChannels(channels)
}
