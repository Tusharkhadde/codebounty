import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getSession(request)
  return user ? NextResponse.json({ authenticated: true, user }) : NextResponse.json({ authenticated: false }, { status: 401 })
}
