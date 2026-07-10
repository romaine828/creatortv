"use client"

import { useState, useEffect } from "react"
import {
  ShoppingCart, Plus, Trash2, Edit2, Save, Loader2, Check,
  ExternalLink, Star, Package, X, RefreshCw, Download
} from "lucide-react"

interface Product {
  id: string; name: string; description: string; price: number
  image: string; category: string; emoji: string; buyLink: string
  inStock: boolean; featured: boolean; variants?: string[]
}
interface StoreSettings {
  storeName: string; tagline: string; description: string
  bannerColor: string; logoEmoji: string; contactEmail: string; shippingNote: string
}

const CATEGORIES = ['apparel', 'drinkware', 'accessories', 'digital', 'other']
const EMOJI_OPTIONS = ['👕', '☕', '🧥', '🎒', '🧢', '🧣', '🖼️', '📱', '💾', '🎁', '🛍️', '📦']
const COLOR_OPTIONS = ['#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']

const blankProduct = (): Omit<Product, 'id'> => ({
  name: '', description: '', price: 0, image: '', category: 'apparel',
  emoji: '👕', buyLink: '', inStock: true, featured: false, variants: []
})

interface Props { appUrl: string }

export function StoreManager({ appUrl }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [editProduct, setEditProduct] = useState<Partial<Product> & { isNew?: boolean } | null>(null)
  const [saving, setSaving] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [savedSettings, setSavedSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState(false)
  const [variantInput, setVariantInput] = useState('')

  const storeUrl = `${appUrl}/store`

  const load = async () => {
    setLoading(true)
    const d = await fetch('/api/store').then(r => r.json())
    setProducts(d.products || []); setSettings(d.settings || null); setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSaveProduct = async () => {
    if (!editProduct?.name || !editProduct?.price) return
    setSaving(true)
    if (editProduct.isNew) {
      const res = await fetch('/api/store', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editProduct) })
      const newP = await res.json()
      setProducts(prev => [...prev, newP])
    } else {
      const { isNew, id, ...data } = editProduct as Product & { isNew?: boolean }
      const res = await fetch('/api/store', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) })
      const updated = await res.json()
      setProducts(prev => prev.map(p => p.id === id ? updated : p))
    }
    setSaving(false); setEditProduct(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await fetch('/api/store', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const toggleFeatured = async (p: Product) => {
    await fetch('/api/store', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, featured: !p.featured }) })
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, featured: !x.featured } : x))
  }

  const toggleStock = async (p: Product) => {
    await fetch('/api/store', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, inStock: !p.inStock }) })
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, inStock: !x.inStock } : x))
  }

  const handleSaveSettings = async () => {
    if (!settings) return
    setSavingSettings(true)
    await fetch('/api/store', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...settings, _action: 'settings' }) })
    setSavingSettings(false); setSavedSettings(true); setTimeout(() => setSavedSettings(false), 2000)
  }

  const addVariant = () => {
    if (!variantInput.trim() || !editProduct) return
    setEditProduct(prev => ({ ...prev, variants: [...(prev?.variants || []), variantInput.trim()] }))
    setVariantInput('')
  }

  const removeVariant = (v: string) => {
    setEditProduct(prev => ({ ...prev, variants: prev?.variants?.filter(x => x !== v) }))
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-5 h-5 text-purple-400 animate-spin" /></div>

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-white text-xl font-black">Merch Store</h2>
          <p className="text-white/40 text-sm mt-1">Sell t-shirts, mugs, and more directly to your fans.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSettingsTab(!settingsTab)}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 hover:border-white/20 text-white/50 hover:text-white transition-all">
            ⚙️ Store Settings
          </button>
          <a href={storeUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 hover:border-white/20 text-white/50 hover:text-white transition-all">
            <ExternalLink className="w-3.5 h-3.5" /> View Store
          </a>
          <button onClick={() => setEditProduct({ ...blankProduct(), isNew: true })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
        </div>
      </div>

      {/* Store URL */}
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/5" style={{ background: '#0e0e1c' }}>
        <div className="flex-1 min-w-0">
          <div className="text-white/50 text-xs font-semibold mb-0.5">🛍️ Your Store URL</div>
          <div className="text-white/30 text-xs font-mono truncate">{storeUrl}</div>
        </div>
        <a href={storeUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
          <ExternalLink className="w-3 h-3" /> Open
        </a>
      </div>

      {/* Settings panel */}
      {settingsTab && settings && (
        <div className="rounded-2xl border border-white/5 p-5" style={{ background: '#0e0e1c' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-sm">Store Settings</h3>
            <button onClick={handleSaveSettings} disabled={savingSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
              {savingSettings ? <Loader2 className="w-3 h-3 animate-spin" /> : savedSettings ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
              {savedSettings ? 'Saved!' : 'Save'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Store Name', key: 'storeName', placeholder: 'e.g. Creator Merch' },
              { label: 'Tagline', key: 'tagline', placeholder: 'e.g. Wear Your Passion' },
              { label: 'Contact Email', key: 'contactEmail', placeholder: 'orders@youremail.com' },
              { label: 'Shipping Note', key: 'shippingNote', placeholder: 'Free shipping over $50' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">{f.label}</label>
                <input value={(settings as any)[f.key] || ''} placeholder={f.placeholder}
                  onChange={e => setSettings(prev => prev ? { ...prev, [f.key]: e.target.value } : prev)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50" />
              </div>
            ))}
            <div>
              <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Logo Emoji</label>
              <div className="flex gap-2 flex-wrap">
                {['🛍️','👕','☕','🎬','🎙️','⭐'].map(e => (
                  <button key={e} onClick={() => setSettings(prev => prev ? { ...prev, logoEmoji: e } : prev)}
                    className="text-xl p-1.5 rounded-lg transition-all"
                    style={{ background: settings.logoEmoji === e ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.05)' }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Banner Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map(col => (
                  <button key={col} onClick={() => setSettings(prev => prev ? { ...prev, bannerColor: col } : prev)}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{ background: col, borderColor: settings.bannerColor === col ? '#fff' : 'transparent' }} />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Store Description</label>
            <textarea value={settings.description} rows={2}
              onChange={e => setSettings(prev => prev ? { ...prev, description: e.target.value } : prev)}
              className="w-full px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 resize-none" />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Products', value: products.length, emoji: '📦' },
          { label: 'In Stock', value: products.filter(p => p.inStock).length, emoji: '✅' },
          { label: 'Featured', value: products.filter(p => p.featured).length, emoji: '⭐' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 border border-white/5 text-center" style={{ background: '#0e0e1c' }}>
            <div className="text-2xl mb-1">{s.emoji}</div>
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Product list */}
      <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: '#0e0e1c' }}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider">Products ({products.length})</h3>
          <button onClick={load} className="text-white/30 hover:text-white transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-14 text-center px-6">
            <div className="text-5xl">🛍️</div>
            <div className="text-white/40 text-sm font-semibold">No products yet</div>
            <div className="text-white/20 text-xs">Click "Add Product" to add your first item</div>
            <button onClick={() => setEditProduct({ ...blankProduct(), isNew: true })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
              <Plus className="w-4 h-4" /> Add First Product
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-all group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'rgba(168,85,247,0.1)' }}>{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-sm font-semibold truncate">{p.name}</span>
                    {p.featured && <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                  </div>
                  <div className="text-white/30 text-xs">
                    ${p.price.toFixed(2)} · {p.category}
                    {p.variants?.length ? ` · ${p.variants.length} variants` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => toggleFeatured(p)} title={p.featured ? 'Unfeature' : 'Feature'}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: p.featured ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.05)' }}>
                    <Star className="w-3.5 h-3.5" style={{ color: p.featured ? '#fbbf24' : 'rgba(255,255,255,0.3)' }} />
                  </button>
                  <button onClick={() => toggleStock(p)} title={p.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold border transition-all"
                    style={p.inStock
                      ? { background: 'rgba(34,197,94,0.1)', color: '#4ade80', borderColor: 'rgba(34,197,94,0.2)' }
                      : { background: 'rgba(239,68,68,0.1)', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}>
                    {p.inStock ? 'In Stock' : 'Out'}
                  </button>
                  <button onClick={() => { setEditProduct({ ...p }); setVariantInput('') }}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/40 hover:text-white transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    className="w-7 h-7 rounded-lg bg-red-500/5 hover:bg-red-500/20 flex items-center justify-center text-red-400/40 hover:text-red-400 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Always visible price on right */}
                <div className="text-white/60 font-bold text-sm flex-shrink-0">${p.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How to sell tip */}
      <div className="rounded-2xl border border-white/5 p-5" style={{ background: '#0e0e1c' }}>
        <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">💡 How to Sell Merch</h3>
        <div className="space-y-2 text-xs text-white/35 leading-relaxed">
          <p><strong className="text-white/50">Option A — Use a print-on-demand service:</strong> Sign up free at <a href="https://printful.com" target="_blank" className="text-cyan-400 hover:underline">Printful</a>, <a href="https://printify.com" target="_blank" className="text-cyan-400 hover:underline">Printify</a>, or <a href="https://teespring.com" target="_blank" className="text-cyan-400 hover:underline">Teespring</a>. Upload your design, get a product link, paste it in the "Buy Link" field — they handle printing, shipping, and returns.</p>
          <p><strong className="text-white/50">Option B — Use your contact email:</strong> Set your email in Store Settings. Fans click "Order Now" and an email draft opens automatically. You handle orders manually.</p>
          <p><strong className="text-white/50">Option C — Link to your Etsy or Amazon store:</strong> Paste the product URL in the "Buy Link" field and fans go straight to checkout.</p>
        </div>
      </div>

      {/* Add/Edit product modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditProduct(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: '#0e0e1c', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.12), transparent)' }}>
              <h3 className="text-white font-black">{editProduct.isNew ? 'Add New Product' : 'Edit Product'}</h3>
              <button onClick={() => setEditProduct(null)} className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Emoji picker */}
              <div>
                <label className="block text-white/40 text-[10px] font-semibold mb-2 uppercase tracking-wider">Product Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJI_OPTIONS.map(e => (
                    <button key={e} onClick={() => setEditProduct(prev => ({ ...prev, emoji: e }))}
                      className="text-xl p-2 rounded-xl transition-all"
                      style={{ background: editProduct.emoji === e ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.05)' }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              {/* Name */}
              <div>
                <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Product Name *</label>
                <input value={editProduct.name || ''} onChange={e => setEditProduct(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. CreatorTV T-Shirt"
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50" />
              </div>
              {/* Price + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Price ($) *</label>
                  <input type="number" min="0" step="0.01" value={editProduct.price || ''} onChange={e => setEditProduct(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="24.99"
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Category</label>
                  <select value={editProduct.category || 'apparel'} onChange={e => setEditProduct(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              {/* Description */}
              <div>
                <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Description</label>
                <textarea value={editProduct.description || ''} rows={2} onChange={e => setEditProduct(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe your product..."
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 resize-none" />
              </div>
              {/* Image URL */}
              <div>
                <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Product Image URL (optional)</label>
                <input value={editProduct.image || ''} onChange={e => setEditProduct(p => ({ ...p, image: e.target.value }))}
                  placeholder="https://... (leave blank to use emoji)"
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50" />
              </div>
              {/* Buy link */}
              <div>
                <label className="block text-white/40 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Buy Link (optional)</label>
                <input value={editProduct.buyLink || ''} onChange={e => setEditProduct(p => ({ ...p, buyLink: e.target.value }))}
                  placeholder="Paste Printful / Etsy / Stripe link here"
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50" />
                <p className="text-white/20 text-[10px] mt-1">Leave blank to use your contact email from Store Settings.</p>
              </div>
              {/* Variants */}
              <div>
                <label className="block text-white/40 text-[10px] font-semibold mb-2 uppercase tracking-wider">Variants (sizes, colors, etc.)</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {(editProduct.variants || []).map(v => (
                    <span key={v} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-white/60 border border-white/10">
                      {v}
                      <button onClick={() => removeVariant(v)} className="text-white/30 hover:text-red-400"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={variantInput} onChange={e => setVariantInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addVariant()}
                    placeholder="e.g. Small, Red, 11oz…"
                    className="flex-1 px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/50" />
                  <button onClick={addVariant} className="px-3 py-2 rounded-xl text-xs font-bold text-purple-400 border border-purple-500/30 hover:bg-purple-500/10 transition-all">+ Add</button>
                </div>
              </div>
              {/* Toggles */}
              <div className="flex gap-4">
                {[
                  { label: 'In Stock', key: 'inStock' },
                  { label: 'Featured', key: 'featured' },
                ].map(t => (
                  <label key={t.key} className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setEditProduct(p => ({ ...p, [t.key]: !(p as any)[t.key] }))}
                      className="w-10 h-5 rounded-full transition-all flex-shrink-0"
                      style={{ background: (editProduct as any)[t.key] ? '#a855f7' : 'rgba(255,255,255,0.1)' }}>
                      <div className="w-4 h-4 rounded-full bg-white m-0.5 transition-all"
                        style={{ transform: (editProduct as any)[t.key] ? 'translateX(20px)' : 'translateX(0)' }} />
                    </div>
                    <span className="text-white/50 text-xs">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/5">
              <button onClick={() => setEditProduct(null)} className="px-4 py-2 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm transition-all">Cancel</button>
              <button onClick={handleSaveProduct} disabled={!editProduct.name || !editProduct.price || saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm text-white disabled:opacity-40 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
