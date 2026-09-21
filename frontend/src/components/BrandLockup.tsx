'use client'

import Image from 'next/image'
import Link from 'next/link'

export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/brand/icon.png"
      alt=""
      width={size}
      height={size}
      className="rounded-md"
    />
  )
}

export function BrandLockup({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <BrandMark />
      <span>CodeBounty</span>
    </Link>
  )
}
