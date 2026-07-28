import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { error: 'GitHub pull request URL parameter is required' },
      { status: 400 }
    )
  }

  const match = url.trim().match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)\/?$/)

  if (!match) {
    return NextResponse.json(
      { error: 'Invalid GitHub pull request URL. Format must be https://github.com/owner/repo/pull/123' },
      { status: 400 }
    )
  }

  const [, owner, repo, pullNumber] = match

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'CodeBounty-App',
    }

    if (process.env.GITHUB_PERSONAL_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_PERSONAL_TOKEN}`
    }

    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`, {
      headers,
      next: { revalidate: 60 },
    })

    if (!ghRes.ok) {
      if (ghRes.status === 404) {
        return NextResponse.json(
          { error: `GitHub pull request #${pullNumber} not found in repository ${owner}/${repo}` },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: `Failed to fetch pull request from GitHub (HTTP ${ghRes.status})` },
        { status: ghRes.status }
      )
    }

    const data = await ghRes.json()

    return NextResponse.json({
      success: true,
      pullRequest: {
        number: data.number,
        title: data.title,
        state: data.state,
        merged: Boolean(data.merged_at),
        mergeCommitSha: data.merge_commit_sha,
        htmlUrl: data.html_url,
        apiUrl: data.url,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to communicate with GitHub API' },
      { status: 500 }
    )
  }
}