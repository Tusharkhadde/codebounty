import type { Metadata } from 'next'
import './globals.css'
import { WalletProvider } from '@/contexts/WalletContext'
import { Sidebar } from '@/components/Sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CodeBounty — Open-source work, funded',
  description: 'Fund and claim open-source bounties with Stellar escrow.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><WalletProvider><SidebarProvider defaultOpen>
    <div className="flex min-h-screen w-full"><Sidebar />
      <div className="min-w-0 flex-1"><MobileHeader /><main className="container-main py-8 sm:py-10">{children}</main><Footer /></div>
    </div>
  </SidebarProvider></WalletProvider></body></html>
}

function MobileHeader() { return <header className="flex h-14 items-center justify-between border-b border-zinc-800 px-4 lg:hidden"><Link href="/" className="font-semibold tracking-tight">CodeBounty</Link><nav className="flex items-center gap-4 text-xs text-zinc-400"><Link href="/bounties" className="hover:text-white">Bounties</Link><Link href="/bounties/create" className="hover:text-white">Create</Link><Link href="/profile" className="hover:text-white">Profile</Link></nav></header> }

function Footer() {
  return <footer className="border-t border-zinc-800"><div className="container-main flex flex-col gap-3 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} CodeBounty</p><div className="flex gap-5"><a href="/about" className="hover:text-zinc-200">How it works</a><a href="/bounties" className="hover:text-zinc-200">Browse bounties</a></div></div></footer>
}
