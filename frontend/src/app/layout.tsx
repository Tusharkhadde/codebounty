import type { Metadata } from 'next'
import './globals.css'
import { WalletProvider } from '@/contexts/WalletContext'
import { Sidebar } from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'CodeBounty - GitHub Bug Bounty Escrow on Stellar',
  description: 'Fund and claim bug bounties with automated payouts via Stellar/Soroban',
  keywords: ['blockchain', 'bug bounty', 'stellar', 'soroban', 'github', 'web3'],
  authors: [{ name: 'CodeBounty Team' }],
  openGraph: {
    title: 'CodeBounty - GitHub Bug Bounty Escrow on Stellar',
    description: 'Fund and claim bug bounties with automated payouts via Stellar/Soroban',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen">
        <WalletProvider>
          <div className="relative min-h-screen flex">
            {/* Background Effects from globals.css */}
            
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
              {/* Main Content */}
              <main className="relative z-10 flex-1 container-main py-8">
                {children}
              </main>
              
              {/* Footer */}
              <Footer />
            </div>
          </div>
        </WalletProvider>
      </body>
    </html>
  )
}

function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/10">
      {/* Gradient fade from content */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] to-transparent opacity-50 pointer-events-none" />
      
      <div className="relative container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20">
                <span className="text-white text-lg font-bold">C</span>
              </div>
              <div>
                <span className="text-white text-xl font-bold">Code</span>
                <span className="text-gray-400 text-xl font-bold">Bounty</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              Automated bug bounty platform built on Stellar. Fund GitHub issues, link PRs, 
              and get paid instantly when contributions are merged through Soroban smart contracts.
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live on Stellar Futurenet
              </span>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Platform
            </h4>
            <ul className="space-y-2.5">
              <li><a href="/" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2 group">Dashboard<span className="group-hover:translate-x-1 transition-transform">→</span></a></li>
              <li><a href="/bounties" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2 group">Browse Bounties<span className="group-hover:translate-x-1 transition-transform">→</span></a></li>
              <li><a href="/create" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2 group">Create Bounty<span className="group-hover:translate-x-1 transition-transform">→</span></a></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Resources
            </h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2 group">Documentation<span className="group-hover:translate-x-1 transition-transform">→</span></a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2 group">Smart Contracts<span className="group-hover:translate-x-1 transition-transform">→</span></a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2 group">Support<span className="group-hover:translate-x-1 transition-transform">→</span></a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            © {new Date().getFullYear()} CodeBounty. Built on Stellar blockchain.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-white text-xs transition-colors">Terms</a>
            <a href="#" className="text-gray-500 hover:text-white text-xs transition-colors">Privacy</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white text-xs transition-colors flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
