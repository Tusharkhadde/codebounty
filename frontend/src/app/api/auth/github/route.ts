import { createHmac, randomBytes, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const sessionName = 'codebounty_session'
const stateName = 'codebounty_oauth_state'
const returnName = 'codebounty_oauth_return'
const appUrl = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const sign = (value: string) => createHmac('sha256', process.env.AUTH_SECRET || '').update(value).digest('base64url')

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) {
    const clientId = process.env.GITHUB_OAUTH_CLIENT_ID
    if (!clientId || !process.env.AUTH_SECRET) return NextResponse.redirect(new URL('/login?error=github-not-configured', appUrl()))
    const state = randomBytes(24).toString('base64url')
    const url = new URL('https://github.com/login/oauth/authorize')
    url.searchParams.set('client_id', clientId); url.searchParams.set('redirect_uri', `${appUrl()}/api/auth/github`); url.searchParams.set('scope', 'read:user user:email'); url.searchParams.set('state', state)
    const response = NextResponse.redirect(url)
    response.cookies.set(stateName, state, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' })
    const next = request.nextUrl.searchParams.get('next') || '/profile'
    const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/profile'
    response.cookies.set(returnName, safeNext, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' })
    return response
  }
  const state = request.nextUrl.searchParams.get('state') || ''
  const stored = cookies().get(stateName)?.value || ''
  if (!stored || state.length !== stored.length || !timingSafeEqual(Buffer.from(state), Buffer.from(stored))) return NextResponse.redirect(new URL('/login?error=invalid-state', appUrl()))
  const token = await fetch('https://github.com/login/oauth/access_token', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: process.env.GITHUB_OAUTH_CLIENT_ID, client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET, code }) }).then(r => r.json())
  if (!token.access_token) return NextResponse.redirect(new URL('/login?error=github-auth-failed', appUrl()))
  const user = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${token.access_token}`, Accept: 'application/vnd.github+json' } }).then(r => r.json())
  const payload = Buffer.from(JSON.stringify({ login: user.login, avatarUrl: user.avatar_url, issuedAt: Math.floor(Date.now() / 1000) })).toString('base64url')
  const returnTo = cookies().get(returnName)?.value || '/profile'
  const response = NextResponse.redirect(new URL(returnTo.startsWith('/') ? returnTo : '/profile', appUrl()))
  response.cookies.set(sessionName, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7, path: '/' })
  response.cookies.delete(stateName)
  response.cookies.delete(returnName)
  return response
}
