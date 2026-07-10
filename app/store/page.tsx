"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Star, Package, Truck, Shield, ArrowRight, Loader2, ExternalLink, Tv } from "lucide-react"

interface Product {
  id: string; name: string; description: string; price: number
  image: string; category: string; emoji: string; buyLink: string
  inStock: boolean; featured: boolean; variants?: string[]
}
interface StoreSettings {
  storeName: string; tagline: string; description: string
  bannerColor: string; logoEmoji: string; contactEmail: string; shippingNote: string
}

const CATEGORY_LABELS: Record<string, string> = {
  all: '🛍️ All Items', apparel: '👕 Apparel', drinkware: '☕ Drinkware',
  accessories: '🎒 Accessories', digital: '💾 Digital', other: '📦 Other'
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<string>('')

  useEffect(() => {
    fetch('/api/store').then(r => r.json()).then(d => {
      setProducts(d.products || [])
      setSettings(d.settings || null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter)
  const featured = products.filter(p => p.featured)

  const handleBuy = (product: Product) => {
    if (product.buyLink) {
      window.open(product.buyLink, '_blank')
    } else {
      setSelectedProduct(product)
      setSelectedVariant(product.variants?.[0] || '')
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#07070f' }}>
      <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
    </div>
  )

  const color = settings?.bannerColor || '#a855f7'

  return (
    <div className="min-h-screen" style={{ background: '#07070f' }}>

      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-30"
        style={{ background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs">
            <Tv className="w-4 h-4" /> CreatorTV
          </a>
          <span className="text-white/20">/</span>
          <span className="text-white font-bold text-sm">{settings?.logoEmoji} {settings?.storeName || 'Store'}</span>
        </div>
        <div className="flex items-center gap-2">
          {settings?.shippingNote && (
            <span className="hidden md:flex items-center gap-1.5 text-xs text-white/40">
              <Truck className="w-3.5 h-3.5" /> {settings.shippingNote}
            </span>
          )}
        </div>
      </header>

      {/* Hero banner */}
      <div className="relative overflow-hidden px-6 py-16 text-center"
        style={{ background: `linear-gradient(135deg, ${color}20, ${color}08, transparent)`, borderBottom: `1px solid ${color}20` }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 70%)` }} />
        <div className="relative">
          <div className="text-5xl mb-4">{settings?.logoEmoji || '🛍️'}</div>
          <h1 className="text-4xl font-black text-white mb-3">{settings?.storeName || 'Creator Store'}</h1>
          <p className="text-white/50 text-lg mb-2">{settings?.tagline || 'Wear Your Passion'}</p>
          {settings?.description && (
            <p className="text-white/30 text-sm max-w-lg mx-auto">{settings.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
          {[
            { icon: Shield, label: 'Secure Checkout' },
            { icon: Truck, label: 'Fast Shipping' },
            { icon: Star, label: 'Quality Guaranteed' },
            { icon: Package, label: 'Easy Returns' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 text-white/30 text-xs">
              <item.icon className="w-4 h-4 text-white/20" />
              {item.label}
            </div>
          ))}
        </div>

        {/* Featured products */}
        {featured.length > 0 && (
          <div className="mb-12">
            <h2 className="text-white font-black text-xl mb-5 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" /> Featured Items
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map(p => (
                <ProductCard key={p.id} product={p} color={color} onBuy={handleBuy} featured />
              ))}
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className="px-4 py-2 rounded-full text-xs font-bold transition-all"
              style={filter === cat
                ? { background: color, color: '#fff' }
                : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {/* All products grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🛍️</div>
            <div className="text-white/40 text-sm">No products in this category yet.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} color={color} onBuy={handleBuy} />
            ))}
          </div>
        )}

        {/* Empty store */}
        {products.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-white text-xl font-black mb-2">Store Coming Soon!</h2>
            <p className="text-white/40 text-sm">Check back soon for amazing merchandise.</p>
          </div>
        )}
      </div>

      {/* Product detail modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#0e0e1c', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={e => e.stopPropagation()}>
            {/* Product image area */}
            <div className="h-48 flex items-center justify-center text-6xl"
              style={{ background: `linear-gradient(135deg, ${color}20, ${color}08)` }}>
              {selectedProduct.image
                ? <img src={selectedProduct.image} alt={selectedProduct.name} className="h-full w-full object-cover" />
                : selectedProduct.emoji}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-black text-lg">{selectedProduct.name}</h3>
                <span className="text-2xl font-black" style={{ color }}>${selectedProduct.price.toFixed(2)}</span>
              </div>
              <p className="text-white/50 text-sm mb-5">{selectedProduct.description}</p>
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div className="mb-5">
                  <label className="block text-white/40 text-xs font-semibold mb-2 uppercase tracking-wider">Select Option</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.variants.map(v => (
                      <button key={v} onClick={() => setSelectedVariant(v)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                        style={selectedVariant === v
                          ? { background: color, borderColor: color, color: '#fff' }
                          : { background: 'transparent', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {settings?.contactEmail && (
                  <a href={`mailto:${settings.contactEmail}?subject=Order: ${selectedProduct.name}${selectedVariant ? ` (${selectedVariant})` : ''}&body=Hi! I'd like to order the ${selectedProduct.name}${selectedVariant ? ` in ${selectedVariant}` : ''} for $${selectedProduct.price.toFixed(2)}. Please let me know how to proceed!`}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${color}, #ec4899)` }}>
                    <ShoppingCart className="w-4 h-4" />
                    Order Now — ${selectedProduct.price.toFixed(2)}
                  </a>
                )}
                <button onClick={() => setSelectedProduct(null)}
                  className="w-full py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all">
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-white/5 py-8 text-center text-white/20 text-xs">
        {settings?.storeName} · Powered by CreatorTV
      </footer>
    </div>
  )
}

function ProductCard({ product, color, onBuy, featured }: {
  product: Product; color: string; onBuy: (p: Product) => void; featured?: boolean
}) {
  return (
    <div className="group rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/15 hover:scale-[1.01]"
      style={{ background: '#0e0e1c', boxShadow: featured ? `0 0 30px ${color}15` : 'none' }}>
      {/* Image / emoji display */}
      <div className="h-44 flex items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}18, ${color}06)` }}>
        {product.image
          ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          : <span className="text-6xl group-hover:scale-110 transition-transform">{product.emoji}</span>}
        {featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black text-white"
            style={{ background: color }}>
            <Star className="w-3 h-3" /> Featured
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white/70 font-bold text-sm">Out of Stock</span>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-white font-bold text-sm leading-tight">{product.name}</h3>
          <span className="font-black text-base flex-shrink-0" style={{ color }}>${product.price.toFixed(2)}</span>
        </div>
        <p className="text-white/35 text-xs leading-relaxed line-clamp-2 mb-4">{product.description}</p>
        {product.variants && product.variants.length > 0 && (
          <div className="flex gap-1 mb-3 flex-wrap">
            {product.variants.slice(0, 4).map(v => (
              <span key={v} className="px-1.5 py-0.5 rounded text-[9px] font-semibold text-white/30 border border-white/10">{v}</span>
            ))}
            {product.variants.length > 4 && (
              <span className="px-1.5 py-0.5 rounded text-[9px] text-white/20">+{product.variants.length - 4} more</span>
            )}
          </div>
        )}
        <button onClick={() => onBuy(product)} disabled={!product.inStock}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: product.inStock ? `linear-gradient(135deg, ${color}, #ec4899)` : 'rgba(255,255,255,0.1)' }}>
          {product.buyLink ? <ExternalLink className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
          {product.inStock ? (product.buyLink ? 'Shop Now' : 'Order Now') : 'Out of Stock'}
        </button>
      </div>
    </div>
  )
}
