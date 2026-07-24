import { neon } from '@neondatabase/serverless'
import { prisma } from '@/lib/prisma'
import type { Bounty } from '@/types'

const CLOUD_KV_URL = 'https://kvdb.io/9A3yR2mK7xL5pQ8j/codebounty_global_bounties'

export function getSql() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEONDB_URL ||
    process.env.NEON_URL
  if (!connectionString) {
    return null
  }
  return neon(connectionString)
}

let tableInitialized = false

export async function initDb() {
  if (tableInitialized) return true
  const sql = getSql()
  if (!sql) return false
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS bounties (
        id INT PRIMARY KEY,
        issue_url TEXT NOT NULL,
        creator TEXT NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        token TEXT,
        deadline BIGINT NOT NULL,
        status TEXT NOT NULL,
        linked_pr_url TEXT,
        contributor TEXT,
        funded_at BIGINT NOT NULL,
        paid_at BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    tableInitialized = true
    return true
  } catch (err) {
    console.error('Failed to initialize database table:', err)
    return false
  }
}

export async function getBountiesFromDb(): Promise<Bounty[] | null> {
  // 1. Try Prisma ORM first if DATABASE_URL environment variable is configured
  if (process.env.DATABASE_URL) {
    try {
      const rows = await prisma.bounty.findMany({
        orderBy: { id: 'desc' },
      })
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          issue_url: r.issueUrl,
          creator: r.creator,
          amount: r.amount,
          token: r.token,
          deadline: Number(r.deadline),
          status: r.status as any,
          linked_pr_url: r.linkedPrUrl,
          contributor: r.contributor,
          funded_at: Number(r.fundedAt),
          paid_at: Number(r.paidAt),
        }))
      }
    } catch (err) {
      console.error('Prisma query error:', err)
    }
  }

  // 2. Try Neon SQL driver
  const sql = getSql()
  if (sql) {
    try {
      await initDb()
      const rows = await sql`
        SELECT id, issue_url, creator, amount, token, deadline, status, linked_pr_url, contributor, funded_at, paid_at 
        FROM bounties 
        ORDER BY id DESC
      `
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          id: Number(r.id),
          issue_url: String(r.issue_url),
          creator: String(r.creator),
          amount: Number(r.amount),
          token: r.token ? String(r.token) : null,
          deadline: Number(r.deadline),
          status: r.status as any,
          linked_pr_url: r.linked_pr_url ? String(r.linked_pr_url) : null,
          contributor: r.contributor ? String(r.contributor) : null,
          funded_at: Number(r.funded_at),
          paid_at: Number(r.paid_at),
        }))
      }
    } catch (err) {
      console.error('Neon DB query error:', err)
    }
  }

  // 3. Cloud serverless persistence fallback so all users/friends see bounties across different devices
  try {
    const res = await fetch(CLOUD_KV_URL, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    }
  } catch (err) {
    console.error('Cloud KV fetch error:', err)
  }

  return null
}

export async function saveBountyToDb(bounty: Bounty): Promise<boolean> {
  let saved = false

  // 1. Save with Prisma ORM if DATABASE_URL is set
  if (process.env.DATABASE_URL) {
    try {
      await prisma.bounty.upsert({
        where: { id: bounty.id },
        update: {
          status: bounty.status,
          linkedPrUrl: bounty.linked_pr_url,
          contributor: bounty.contributor,
          paidAt: BigInt(bounty.paid_at || 0),
        },
        create: {
          id: bounty.id,
          issueUrl: bounty.issue_url,
          creator: bounty.creator,
          amount: bounty.amount,
          token: bounty.token,
          deadline: BigInt(bounty.deadline),
          status: bounty.status,
          linkedPrUrl: bounty.linked_pr_url,
          contributor: bounty.contributor,
          fundedAt: BigInt(bounty.funded_at),
          paidAt: BigInt(bounty.paid_at || 0),
        },
      })
      saved = true
    } catch (err) {
      console.error('Prisma upsert error:', err)
    }
  }

  // 2. Save with Neon SQL driver if DATABASE_URL / NEON_DATABASE_URL is set
  const sql = getSql()
  if (sql) {
    try {
      await initDb()
      await sql`
        INSERT INTO bounties (id, issue_url, creator, amount, token, deadline, status, linked_pr_url, contributor, funded_at, paid_at)
        VALUES (${bounty.id}, ${bounty.issue_url}, ${bounty.creator}, ${bounty.amount}, ${bounty.token}, ${bounty.deadline}, ${bounty.status}, ${bounty.linked_pr_url}, ${bounty.contributor}, ${bounty.funded_at}, ${bounty.paid_at})
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          linked_pr_url = EXCLUDED.linked_pr_url,
          contributor = EXCLUDED.contributor,
          paid_at = EXCLUDED.paid_at;
      `
      saved = true
    } catch (err) {
      console.error('Neon DB save error:', err)
    }
  }

  // 3. Save to Cloud KV storage so all devices across the web share the exact same global list
  try {
    const existing = (await getBountiesFromDb()) || []
    const map = new Map<number, Bounty>()
    map.set(bounty.id, bounty)
    existing.forEach(b => {
      if (!map.has(b.id)) {
        map.set(b.id, b)
      } else {
        const curr = map.get(b.id)!
        map.set(b.id, { ...b, ...curr })
      }
    })
    const updated = Array.from(map.values())
    await fetch(CLOUD_KV_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    saved = true
  } catch (err) {
    console.error('Cloud KV save error:', err)
  }

  return saved
}
