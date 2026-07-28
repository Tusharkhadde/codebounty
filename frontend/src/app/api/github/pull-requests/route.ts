import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const issueUrl = request.nextUrl.searchParams.get('issueUrl')

  if (!issueUrl) {
    return NextResponse.json(
      { error: 'GitHub issue URL parameter is required' },
      { status: 400 }
    )
  }

  const match = issueUrl.trim().match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)\/?$/)
  if (!match) {
    return NextResponse.json(
      { error: 'Invalid GitHub issue URL. Format must be https://github.com/owner/repo/issues/123' },
      { status: 400 }
    )
  }

  const [, owner, repo, issueNumber] = match
  const query = `repo:${owner}/${repo}+type:pr+in:title,body+%23${issueNumber}`
  const searchUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=30`

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'CodeBounty-App',
    }

    if (process.env.GITHUB_PERSONAL_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_PERSONAL_TOKEN}`
    }

    const ghRes = await fetch(searchUrl, { headers, next: { revalidate: 60 } })
    if (!ghRes.ok) {
      return NextResponse.json(
        { error: `Failed to query GitHub PRs (HTTP ${ghRes.status})` },
        { status: ghRes.status }
      )
    }

    const data = await ghRes.json()
    const pullRequests = Array.isArray(data.items)
      ? data.items.map((item: any) => ({
          number: item.number,
          title: item.title,
          state: item.state,
          htmlUrl: item.html_url,
          apiUrl: item.url,
          author: item.user?.login || 'unknown',
        }))
      : []

    return NextResponse.json({ success: true, pullRequests })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to communicate with GitHub API' },
      { status: 500 }
    )
  }
}
