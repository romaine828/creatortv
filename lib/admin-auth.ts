// Shared admin-login helpers. Works in both middleware (edge) and API routes (node)
// because it only uses the Web Crypto API.
export const ADMIN_COOKIE = 'ctv_admin'
export const SESSION_SECONDS = 60 * 60 * 24 * 7 // stay logged in for 7 days

const enc = new TextEncoder()

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Make a signed session value: "<expiry>.<signature>" */
export async function createSession(): Promise<string | null> {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) return null
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS
  return `${exp}.${await hmacHex(secret, `admin.${exp}`)}`
}

/** True only for a correctly signed, unexpired session value. */
export async function verifySession(value: string | undefined | null): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || !value) return false
  const [expStr, sig] = value.split('.')
  const exp = Number(expStr)
  if (!sig || !Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false
  return safeEqual(sig, await hmacHex(secret, `admin.${exp}`))
}

/** Compare the typed password with ADMIN_PASSWORD without leaking timing. */
export async function passwordMatches(typed: string): Promise<boolean> {
  const real = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!real || !secret || !typed) return false
  // Hash both so the lengths are equal, then compare in constant time.
  return safeEqual(await hmacHex(secret, `pw.${typed}`), await hmacHex(secret, `pw.${real}`))
}
