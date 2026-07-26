import { neon } from '@neondatabase/serverless'
import { getPrisma } from '@/lib/prisma'
import type { Bounty } from '@/types'

const CLOUD_STORAGE_URL = 'https://jsonblob.com/api/jsonBlob/019f9dec-7b39-729e-97df-467a210d2252'

export async function clearAllBountiesDb(): Promise<boolean> {
  try {
    await fetch(CLOUD_STORAGE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify([]),
    })
  } catch (err) {
    console.error('Failed to clear Cloud Storage:', err)
  }

  const sql = getSql()
  if (sql) {
    try {
      await initDb()
      await sql`TRUNCATE TABLE bounties;`
    } catch (err) {
      console.error('Failed to truncate Neon DB:', err)
    }
  }

  const prisma = getPrisma()
  if (prisma) {
    try {
      await prisma.bounty.deleteMany({})
    } catch (err) {
      console.error('Failed to clear Prisma bounties:', err)
    }
  }

  return true
}

export function getSql() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEONDB_URL ||
    process.env.NEON_URL

  if (!connectionString) return null

  try {
    return neon(connectionString)
  } catch (e) {
    return null
  }
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
  const allBountiesMap = new Map<number, Bounty>()

  // 1. Try Prisma ORM if DATABASE_URL environment variable is set
  const prisma = getPrisma()
  if (prisma) {
    try {
      const rows = await prisma.bounty.findMany({
        orderBy: { id: 'desc' },
      })
      if (rows && rows.length > 0) {
        rows.forEach((r: any) => {
          allBountiesMap.set(r.id, {
            id: Number(r.id),
            issue_url: String(r.issueUrl),
            creator: String(r.creator),
            amount: Number(r.amount),
            token: r.token ? String(r.token) : null,
            deadline: Number(r.deadline),
            status: r.status as any,
            linked_pr_url: r.linkedPrUrl ? String(r.linkedPrUrl) : null,
            contributor: r.contributor ? String(r.contributor) : null,
            funded_at: Number(r.fundedAt),
            paid_at: Number(r.paidAt),
          })
        })
      }
    } catch (err) {
      console.error('Prisma query error:', err)
    }
  }

  // 2. Try Neon SQL driver if connection string is configured
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
        rows.forEach((r: any) => {
          allBountiesMap.set(Number(r.id), {
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
          })
        })
      }
    } catch (err) {
      console.error('Neon DB query error:', err)
    }
  }

  // 3. Try Cloud Storage JSON fallback
  try {
    const res = await fetch(CLOUD_STORAGE_URL, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((b: Bounty) => {
          if (!allBountiesMap.has(b.id)) {
            allBountiesMap.set(b.id, b)
          }
        })
      }
    }
  } catch (err) {
    console.error('Cloud Storage fetch error:', err)
  }

  const result = Array.from(allBountiesMap.values())
  return result.length > 0 ? result : null
}

export async function saveBountyToDb(bounty: Bounty): Promise<boolean> {
  let saved = false

  // 1. Save with Prisma ORM if DATABASE_URL is set
  const prisma = getPrisma()
  if (prisma) {
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

  // 2. Save with Neon SQL driver if connection string is configured
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

  // 3. Save to Cloud JSON storage so all devices across the web share the exact same global list
  try {
    const existing = (await getBountiesFromDb()) || []
    const map = new Map<number, Bounty>()
    map.set(bounty.id, bounty)
    existing.forEach((b: Bounty) => {
      if (!map.has(b.id)) {
        map.set(b.id, b)
      } else {
        const curr = map.get(b.id)!
        map.set(b.id, { ...b, ...curr })
      }
    })
    const updated = Array.from(map.values())
    await fetch(CLOUD_STORAGE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(updated),
    })
    saved = true
  } catch (err) {
    console.error('Cloud storage save error:', err)
  }

  return saved
}
