import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { error: 'GitHub issue URL parameter is required' },
      { status: 400 }
    )
  }

  // Match pattern https://github.com/:owner/:repo/issues/:number
  const match = url.trim().match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)\/?$/)

  if (!match) {
    return NextResponse.json(
      { error: 'Invalid GitHub issue URL. Format must be https://github.com/owner/repo/issues/123' },
      { status: 400 }
    )
  }

  const [, owner, repo, issueNumber] = match

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'CodeBounty-App',
    }

    if (process.env.GITHUB_PERSONAL_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_PERSONAL_TOKEN}`
    }

    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
      headers,
      next: { revalidate: 60 }
    })

    if (!ghRes.ok) {
      if (ghRes.status === 404) {
        return NextResponse.json(
          { error: `GitHub issue #${issueNumber} not found in repository ${owner}/${repo}` },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: `Failed to fetch issue from GitHub (HTTP ${ghRes.status})` },
        { status: ghRes.status }
      )
    }

    const data = await ghRes.json()

    // Ensure it's an issue and not a pull request endpoint response
    if (data.pull_request) {
      return NextResponse.json(
        { error: 'The provided URL points to a Pull Request, not an Issue. Please provide an Issue URL.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      issue: {
        title: data.title,
        body: data.body || '',
        state: data.state,
        repository: `${owner}/${repo}`,
        issueNumber: parseInt(issueNumber, 10),
        author: data.user?.login || 'unknown',
        avatarUrl: data.user?.avatar_url || '',
        labels: data.labels?.map((l: any) => ({ name: l.name, color: l.color })) || [],
        commentsCount: data.comments || 0,
        createdAt: data.created_at,
        htmlUrl: data.html_url,
      }
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to communicate with GitHub API' },
      { status: 500 }
    )
  }
}
