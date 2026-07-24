import { neon } from '@neondatabase/serverless'
import type { Bounty } from '@/types'

export function getSql() {
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
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
    console.error('Failed to initialize Neon database table:', err)
    return false
  }
}

export async function getBountiesFromDb(): Promise<Bounty[] | null> {
  const sql = getSql()
  if (!sql) return null
  try {
    await initDb()
    const rows = await sql`
      SELECT id, issue_url, creator, amount, token, deadline, status, linked_pr_url, contributor, funded_at, paid_at 
      FROM bounties 
      ORDER BY id DESC
    `
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
  } catch (err) {
    console.error('Neon DB query error:', err)
    return null
  }
}

export async function saveBountyToDb(bounty: Bounty): Promise<boolean> {
  const sql = getSql()
  if (!sql) return false
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
    return true
  } catch (err) {
    console.error('Neon DB save error:', err)
    return false
  }
}
