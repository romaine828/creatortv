import { kvGetOne, kvUpsert, kvGetAll, kvDelete } from './kv-store'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  emoji: string
  buyLink: string
  inStock: boolean
  featured: boolean
  variants?: string[]
}

export interface StoreSettings {
  storeName: string
  tagline: string
  description: string
  bannerColor: string
  logoEmoji: string
  contactEmail: string
  shippingNote: string
}

const defaultSettings: StoreSettings = {
  storeName: 'Creator Store',
  tagline: 'Wear Your Passion',
  description: 'Official merchandise from your favorite creator. Quality products, shipped with love.',
  bannerColor: '#a855f7',
  logoEmoji: '🛍️',
  contactEmail: '',
  shippingNote: 'Free shipping on orders over $50',
}

const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'CreatorTV Logo T-Shirt',
    description: 'Soft premium cotton tee with the CreatorTV logo. Available in multiple colors.',
    price: 24.99, image: '', category: 'apparel', emoji: '👕', buyLink: '',
    inStock: true, featured: true, variants: ['S', 'M', 'L', 'XL', '2XL'],
  },
  {
    id: 'prod-2',
    name: 'CreatorTV Coffee Mug',
    description: '11oz ceramic mug with bold CreatorTV branding. Start every morning like a creator.',
    price: 14.99, image: '', category: 'drinkware', emoji: '☕', buyLink: '',
    inStock: true, featured: true, variants: ['11oz', '15oz'],
  },
  {
    id: 'prod-3',
    name: 'Creator Hoodie',
    description: 'Cozy pullover hoodie — perfect for late night content creation sessions.',
    price: 44.99, image: '', category: 'apparel', emoji: '🧥', buyLink: '',
    inStock: true, featured: false, variants: ['S', 'M', 'L', 'XL'],
  },
]

export async function getStoreSettings(): Promise<StoreSettings> {
  const saved = await kvGetOne<StoreSettings>('store_settings', 'default')
  return saved ? { ...defaultSettings, ...saved } : defaultSettings
}

export async function saveStoreSettings(s: Partial<StoreSettings>): Promise<StoreSettings> {
  const updated = { ...(await getStoreSettings()), ...s }
  await kvUpsert('store_settings', 'default', updated)
  return updated
}

export async function getProducts(): Promise<Product[]> {
  const products = await kvGetAll<Product>('store_products')
  if (products.length > 0) return products
  return defaultProducts
}

export async function addProduct(p: Omit<Product, 'id'>): Promise<Product> {
  const newP: Product = { ...p, id: `prod-${Date.now()}` }
  await kvUpsert('store_products', newP.id, newP)
  return newP
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  const products = await getProducts()
  const i = products.findIndex(p => p.id === id)
  if (i === -1) return null
  const updated = { ...products[i], ...data }
  await kvUpsert('store_products', id, updated)
  return updated
}

export async function deleteProduct(id: string): Promise<boolean> {
  await kvDelete('store_products', id)
  return true
}
