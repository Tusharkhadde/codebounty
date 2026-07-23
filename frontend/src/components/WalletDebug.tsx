import React from 'react'
import { useWallet } from '@/contexts/WalletContext'

export function WalletDebug() {
  const { connected, address, network, connecting, error, freighterInstalled, demoMode, rawError, connect, enableDemoMode } = useWallet() as any

  const copyRaw = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(rawError, null, 2))
    } catch {
      // ignore
    }
  }

  const isNotInstalled = !freighterInstalled || /not installed|not detected|unaccessible|unaccessible/i.test(String(error || ''))
  const isPopupBlocked = /popup|blocked|closed window/i.test(String(error || ''))
  const isTimedOut = /timed out/i.test(String(error || ''))

  const openFreighterSite = () => window.open('https://www.freighter.app', '_blank')

  return (
    <div style={{position: 'fixed', right: 12, bottom: 12, zIndex: 9999, width: 360}}>
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-200">
        <div className="flex items-center justify-between mb-2">
          <strong className="text-sm">Wallet Debug</strong>
          <div className="flex items-center gap-2">
            <button onClick={() => connect()} className="px-2 py-1 rounded bg-teal-500/10 text-teal-300 text-[11px]">Reconnect</button>
          </div>
        </div>
        <div className="space-y-1">
          <div><span className="font-semibold">freighterInstalled:</span> {String(freighterInstalled)}</div>
          <div><span className="font-semibold">connected:</span> {String(connected)}</div>
          <div><span className="font-semibold">connecting:</span> {String(connecting)}</div>
          <div><span className="font-semibold">demoMode:</span> {String(demoMode)}</div>
          <div><span className="font-semibold">network:</span> {network}</div>
          <div className="break-all"><span className="font-semibold">address:</span> {address ?? '—'}</div>
          <div className="text-amber-300"><span className="font-semibold">error:</span> {error ?? 'none'}</div>
          <div className="pt-2">
            <div className="text-[11px] text-slate-400 mb-1">Raw Error</div>
            <pre className="overflow-auto max-h-28 rounded bg-black/20 p-2 text-[11px]">{rawError ? JSON.stringify(rawError, null, 2) : 'none'}</pre>
            {rawError && (
              <div className="mt-2 text-right">
                <button onClick={copyRaw} className="text-[11px] px-2 py-1 rounded bg-teal-500/10 text-teal-300">Copy raw</button>
              </div>
            )}
            <div className="mt-3 space-y-2">
              {isNotInstalled && (
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[12px] text-slate-300">Freighter not detected.</div>
                  <button onClick={openFreighterSite} className="px-2 py-1 rounded bg-teal-500/10 text-teal-300 text-[12px]">Install Freighter</button>
                </div>
              )}

              {isPopupBlocked && (
                <div className="text-[12px] text-slate-300">
                  Popup may be blocked. Click your browser extension icon and allow access, then press <strong>Reconnect</strong>.
                </div>
              )}

              {isTimedOut && (
                <div className="text-[12px] text-slate-300">Timeout: unlock Freighter and try Reconnect.</div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button onClick={() => (window.location.reload())} className="text-[11px] px-2 py-1 rounded bg-white/5">Reload Page</button>
                <button onClick={() => (window.location.href = '/profile?debug=wallet') } className="text-[11px] px-2 py-1 rounded bg-white/5">Open Profile</button>
                <button onClick={() => (navigator.clipboard.writeText(error ?? ''))} className="text-[11px] px-2 py-1 rounded bg-white/5">Copy Error</button>
                <button onClick={() => (enableDemoMode && enableDemoMode())} className="text-[11px] px-2 py-1 rounded bg-teal-500/10 text-teal-300">Use Demo</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletDebug
