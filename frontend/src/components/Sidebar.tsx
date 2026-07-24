'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { LayoutDashboard, Award, PlusCircle, Info, User, Wallet, LogOut, AlertCircle, X } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const { connected, connecting, error, disconnect, address, connect, enableDemoMode, demoMode, clearError } = useWallet()

  const formatAddress = (addr: string | null): string => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const isActive = (path: string) => pathname === path

  const navItems = [
    { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { title: 'Bounties', url: '/bounties', icon: Award },
    { title: 'Create Bounty', url: '/bounties/create', icon: PlusCircle, highlight: true },
    { title: 'About', url: '/about', icon: Info },
    { title: 'Profile', url: '/profile', icon: User },
  ]

  return (
    <ShadcnSidebar collapsible="none" className="w-64 h-screen sticky top-0 shrink-0 border-r border-white/10 bg-[#06080d]/95 backdrop-blur-xl text-[#e2e3e9]">
      {/* Brand Header */}
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-300 to-cyan-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-teal-500/40 transition-all duration-300 group-hover:scale-110">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold">
            <span className="text-gradient">Code</span>
            <span className="text-slate-400">Bounty</span>
          </span>
        </Link>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="py-6 px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={active}
                      className={
                        item.highlight
                          ? "text-teal-300 hover:text-white bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 font-semibold"
                          : active
                          ? "bg-teal-400/10 text-teal-300 font-semibold border border-teal-300/20"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }
                    >
                      <Link href={item.url} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer / Wallet Integration */}
      <SidebarFooter className="p-4 border-t border-white/10 shrink-0 space-y-2">
        {error && (
          <div className="flex items-start gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg mb-3 relative">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="text-red-300 text-[11px] leading-tight break-words pr-4">{error}</span>
            <button onClick={clearError} className="absolute right-2 top-2 text-red-400 hover:text-red-300 p-0.5 rounded-md hover:bg-red-500/20 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {connected ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-lg justify-center">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-teal-300 text-xs font-medium font-mono">
                {demoMode ? 'Demo Mode' : formatAddress(address)}
              </span>
            </div>
            <Button
              onClick={disconnect}
              variant="secondary"
              className="w-full justify-center text-xs py-1.5"
              size="sm"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              <span>Disconnect</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => connect()} 
              disabled={connecting} 
              className="w-full justify-center py-2.5 text-xs font-bold shadow-lg shadow-teal-500/20" 
              size="sm"
            >
              {connecting ? (
                <>
                  <span className="loading-spinner-sm mr-2" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-1.5" />
                  <span>Connect Wallet</span>
                </>
              )}
            </Button>

            <button
              onClick={() => enableDemoMode()}
              className="text-[11px] text-slate-400 hover:text-teal-300 text-center transition-colors underline"
            >
              Or try Testnet Demo Mode
            </button>
          </div>
        )}
      </SidebarFooter>
    </ShadcnSidebar>
  )
}
