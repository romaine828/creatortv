import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifySession } from '@/lib/admin-auth'

// Pages only the owner may open.
const ADMIN_PAGES = ['/admin', '/studio']

// Which API calls need the owner's login. Everything not listed stays public.
function apiNeedsAdmin(path: string, method: string): boolean {
  const m = method.toUpperCase()
  const isWrite = m !== 'GET' && m !== 'HEAD' && m !== 'OPTIONS'
  if (path.startsWith('/api/admin')) return false            // login / logout / me
  if (path === '/api/upload') return true                    // file uploads
  if (path === '/api/subscribers') return m !== 'POST'       // visitors may subscribe; only the owner reads the list
  if (path === '/api/affiliates') return true                // full affiliate list
  if (path === '/api/affiliates/action' || path === '/api/affiliates/payout') return true
  if (path.startsWith('/api/affiliates/')) return false      // apply, track, convert, lookup stay public
  if (path === '/api/community' || path === '/api/qa') return m === 'PUT' || m === 'DELETE' || m === 'PATCH' // visitors may post / ask
  return isWrite                                              // channels, exclusive-content, store, site-links: owner edits, anyone reads
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAdmin = await verifySession(req.cookies.get(ADMIN_COOKIE)?.value)

  // Never trust an "x-admin" header sent by a visitor; set it ourselves.
  const headers = new Headers(req.headers)
  headers.delete('x-admin')
  if (isAdmin) headers.set('x-admin', '1')

  if (pathname.startsWith('/api/')) {
    if (apiNeedsAdmin(pathname, req.method) && !isAdmin) {
      return NextResponse.json({ error: 'Owner login required' }, { status: 401 })
    }
    return NextResponse.next({ request: { headers } })
  }

  if (ADMIN_PAGES.some(p => pathname === p || pathname.startsWith(p + '/')) && !isAdmin) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.search = `?next=${encodeURIComponent(pathname + req.nextUrl.search)}`
    return NextResponse.redirect(url)
  }
  return NextResponse.next({ request: { headers } })
}

export const config = { matcher: ['/admin/:path*', '/studio/:path*', '/api/:path*'] }
