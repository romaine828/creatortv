"use client"

import { useState } from "react"
import { Lock } from "lucide-react"

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      if (res.ok) {
        const next = new URLSearchParams(window.location.search).get('next') || '/'
        // only allow going to a page on this same site
        window.location.href = next.startsWith('/') && !next.startsWith('//') ? next : '/'
        return
      }
      const d = await res.json().catch(() => ({}))
      setError(d.error || 'Could not log in')
    } catch { setError('Network error. Please try again.') }
    setBusy(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#070710' }}>
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-white/10 p-6" style={{ background: '#0e0e1c' }}>
        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}>
          <Lock className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-white font-bold text-lg text-center mb-1">Owner Login</h1>
        <p className="text-white/40 text-xs text-center mb-5">This area is for the site owner only.</p>
        <input type="password" autoFocus value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-purple-400/50 mb-3" />
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <button type="submit" disabled={busy || !password}
          className="w-full py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}>
          {busy ? 'Checking…' : 'Log in'}
        </button>
        <a href="/" className="block text-center text-white/30 text-[11px] mt-4 hover:text-white/60">← Back to the site</a>
      </form>
    </div>
  )
}
