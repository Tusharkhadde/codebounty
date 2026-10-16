export interface GithubPullRequestRef {
  owner: string
  repo: string
  number: number
}

const PR_URL_RE = /^https:\/\/github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)\/pull\/(\d+)(?:\/(?:files|commits|checks)?)?\/?(?:[?#].*)?$/

/** Parse https://github.com/owner/repo/pull/123 into its parts, or null if invalid. */
export function parseGithubPullRequestUrl(url: string): GithubPullRequestRef | null {
  if (typeof url !== 'string') return null
  const match = url.trim().match(PR_URL_RE)
  if (!match) return null
  const [, owner, repo, num] = match
  const number = parseInt(num, 10)
  if (!Number.isSafeInteger(number) || number <= 0) return null
  return { owner, repo, number }
}

/** fetch() against the GitHub REST API with standard headers and optional token. */
export function githubFetch(url: string, init: RequestInit & { revalidate?: number } = {}) {
  const { revalidate = 60, headers: extra, ...rest } = init
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'CodeBounty-App',
    ...(extra as Record<string, string> | undefined),
  }
  if (process.env.GITHUB_PERSONAL_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_PERSONAL_TOKEN}`
  }
  return fetch(url, { ...rest, headers, next: { revalidate } } as RequestInit)
}
