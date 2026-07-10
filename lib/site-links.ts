import { kvGetOne, kvUpsert } from './kv-store'

export interface SiteLinks {
  podcastUrl: string
  scriptureCardsUrl: string
  customLink1Label: string
  customLink1Url: string
}

const DEFAULTS: SiteLinks = {
  podcastUrl: '',
  scriptureCardsUrl: '',
  customLink1Label: '',
  customLink1Url: '',
}

export async function getSiteLinks(): Promise<SiteLinks> {
  const saved = await kvGetOne<SiteLinks>('site_links', 'default')
  return saved ? { ...DEFAULTS, ...saved } : DEFAULTS
}

export async function saveSiteLinks(links: Partial<SiteLinks>): Promise<SiteLinks> {
  const updated = { ...(await getSiteLinks()), ...links }
  await kvUpsert('site_links', 'default', updated)
  return updated
}
