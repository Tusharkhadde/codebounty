import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createHmac } from 'crypto'

const sessionName = 'codebounty_session'
const sign = (value: string) => createHmac('sha256', process.env.AUTH_SECRET || '').update(value).digest('base64url')

export async function GET() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get(sessionName)?.value

  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const [payload, signature] = sessionCookie.split('.')
  
  if (!payload || !signature || sign(payload) !== signature) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  try {
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'))
    return NextResponse.json({ authenticated: true, user })
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
