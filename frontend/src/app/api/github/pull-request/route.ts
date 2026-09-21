import { NextRequest, NextResponse } from 'next/server'
import { githubFetch, parseGithubPullRequestUrl } from '@/lib/github'
import { rejectIfRateLimited } from '@/lib/http-limit'

export async function GET(request: NextRequest) {
  const limited = rejectIfRateLimited(request, 'github-pr', 20, 60_000)
  if (limited) return limited

  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'GitHub pull request URL parameter is required' }, { status: 400 })
  }

  const parsed = parseGithubPullRequestUrl(url)
  if (!parsed) {
    return NextResponse.json(
      { error: 'Invalid GitHub pull request URL. Format must be https://github.com/owner/repo/pull/123' },
      { status: 400 }
    )
  }

  try {
    const ghRes = await githubFetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/pulls/${parsed.number}`
    )

    if (!ghRes.ok) {
      if (ghRes.status === 404) {
        return NextResponse.json(
          { error: `GitHub pull request #${parsed.number} not found in repository ${parsed.owner}/${parsed.repo}` },
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
