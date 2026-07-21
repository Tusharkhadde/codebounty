'use client'

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react'
import type { WalletState } from '@/types'
import {
  isConnected,
  requestAccess,
  getAddress,
  getNetwork,
} from '@stellar/freighter-api'

const CONNECT_TIMEOUT_MS = 15_000
const RAPID_CLICK_LOCK_MS = 1_000

interface FreighterError {
  code: number
  message: string
}

interface FreighterResponse {
  address: string
  error?: FreighterError
}

interface WalletContextType extends WalletState {
  freighterInstalled: boolean
  connect: () => Promise<void>
  disconnect: () => void
  clearError: () => void
  demoMode: boolean
  enableDemoMode: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    network: 'testnet',
    connecting: false,
    error: null,
  })
  const [freighterInstalled, setFreighterInstalled] = useState<boolean>(true)
  const [demoMode, setDemoMode] = useState<boolean>(false)

  const mountedRef = useRef(true)
  const connectingLockRef = useRef(false)
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Check initial extension installation on mount
  useEffect(() => {
    mountedRef.current = true
    const checkInstallation = async () => {
      const hasWindowFreighter = typeof window !== 'undefined' && (
        'freighter' in window || 'stellar' in window || (window as unknown as { isFreighter?: boolean }).isFreighter
      )
      if (hasWindowFreighter) {
        if (mountedRef.current) setFreighterInstalled(true)
        return
      }
      try {
        const result = await isConnected()
        if (mountedRef.current) {
          setFreighterInstalled(result.isConnected)
        }
      } catch {
        if (mountedRef.current) setFreighterInstalled(false)
      }
    }
    checkInstallation()

    return () => {
      mountedRef.current = false
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current)
    }
  }, [])

  const safeSetState = useCallback((updater: React.SetStateAction<WalletState>) => {
    if (mountedRef.current) setState(updater)
  }, [])

  const safeSetFreighterInstalled = useCallback((value: boolean) => {
    if (mountedRef.current) setFreighterInstalled(value)
  }, [])

  function extractFreighterError(res: FreighterResponse | undefined | null): string | null {
    if (!res) return null
    if (res.error?.message) {
      const msg = res.error.message
      if (/declined|denied|rejected|cancelled/i.test(msg)) {
        return 'Connection declined in Freighter. Open Freighter extension, unlock it, and approve access.'
      }
      return `Freighter error: ${msg}`
    }
    return null
  }

  const enableDemoMode = useCallback(() => {
    setDemoMode(true)
    safeSetState({
      connected: true,
      address: 'GBTESTNETDEMO99999999999999999999999999999999999999',
      network: 'testnet',
      connecting: false,
      error: null,
    })
  }, [safeSetState])

  const connect = useCallback(async () => {
    if (connectingLockRef.current) {
      safeSetState(prev => ({
        ...prev,
        error: 'Please wait — previous connection request is still in progress.',
      }))
      return
    }

    connectingLockRef.current = true
    safeSetState(prev => ({ ...prev, connecting: true, error: null }))

    const timeout = new Promise<never>((_, reject) => {
      connectTimeoutRef.current = setTimeout(() => {
        reject(new Error('Connection timed out. Freighter did not respond.'))
      }, CONNECT_TIMEOUT_MS)
    })

    try {
      // 1. Check if window.freighter exists or isConnected() returns true
      const hasWindowFreighter = typeof window !== 'undefined' && (
        'freighter' in window || 'stellar' in window || (window as unknown as { isFreighter?: boolean }).isFreighter
      )

      let connectionStatus = { isConnected: false }
      try {
        connectionStatus = await Promise.race([
          isConnected().catch(() => ({ isConnected: false })),
          timeout,
        ])
      } catch {
        // timeout or error
      }

      let rawAddress: string | undefined
      let freighterRes: FreighterResponse | undefined

      if (!connectionStatus.isConnected && !hasWindowFreighter) {
        // Check window objects once more
        const reqResult = await Promise.race([
          requestAccess().catch((err) => {
            throw new Error(err?.message || 'Freighter extension is not installed or unaccessible.')
          }),
          timeout
        ]) as FreighterResponse

        freighterRes = reqResult
        const errStr = extractFreighterError(reqResult)
        if (errStr) throw new Error(errStr)
        rawAddress = reqResult.address
      } else if (!connectionStatus.isConnected) {
        const res = await Promise.race([
          requestAccess(),
          timeout,
        ]) as FreighterResponse

        freighterRes = res
        const freighterErr = extractFreighterError(res)
        if (freighterErr) throw new Error(freighterErr)
        rawAddress = res.address
      } else {
        const res = await Promise.race([
          getAddress(),
          timeout,
        ]) as FreighterResponse

        freighterRes = res
        const freighterErr = extractFreighterError(res)
        if (freighterErr) throw new Error(freighterErr)
        rawAddress = res.address
      }

      if (!rawAddress) throw new Error('Wallet access was not granted or Freighter popup was closed.')

      const trimmed = rawAddress.trim()
      if (!trimmed || trimmed.length < 20) {
        throw new Error('Invalid wallet address received from Freighter.')
      }

      let network = 'testnet'
      try {
        const netRes = await getNetwork()
        const net = netRes.network?.toLowerCase()
        if (net === 'public' || net === 'mainnet') network = 'mainnet'
        else if (net === 'testnet') network = 'testnet'
        else if (net === 'futurenet') network = 'futurenet'
      } catch {
        // default testnet
      }

      if (!mountedRef.current) return

      setDemoMode(false)
      safeSetState({
        connected: true,
        address: trimmed,
        network,
        connecting: false,
        error: null,
      })
      safeSetFreighterInstalled(true)
    } catch (err) {
      if (!mountedRef.current) return

      const message = err instanceof Error ? err.message : 'Failed to connect wallet'

      const notInstalled =
        /not installed|not detected|unaccessible|cannot read|undefined/i.test(message)
      const timedOut = /timed out/i.test(message)
      const popupBlocked = /popup|blocked|closed window/i.test(message)
      const declined = /declined|denied|rejected/i.test(message)

      safeSetFreighterInstalled(!notInstalled)

      let friendly: string
      if (notInstalled) {
        friendly = 'Freighter extension is not detected in your browser. Install Freighter or try Testnet Demo Mode below!'
      } else if (timedOut) {
        friendly = 'Connection timed out. Open your Freighter browser extension and make sure it is unlocked.'
      } else if (popupBlocked) {
        friendly = 'Freighter extension popup might be minimized or blocked. Click your browser extension icon.'
      } else if (declined) {
        friendly = 'Connection declined in Freighter. Please approve the request to connect.'
      } else {
        friendly = message
      }

      safeSetState(prev => ({
        ...prev,
        connected: false,
        connecting: false,
        error: friendly,
      }))

    } finally {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current)
        connectTimeoutRef.current = null
      }
      setTimeout(() => {
        connectingLockRef.current = false
      }, RAPID_CLICK_LOCK_MS)
    }
  }, [safeSetState, safeSetFreighterInstalled])

  const disconnect = useCallback(() => {
    setDemoMode(false)
    safeSetState({
      connected: false,
      address: null,
      network: 'testnet',
      connecting: false,
      error: null,
    })
  }, [safeSetState])

  const clearError = useCallback(() => {
    safeSetState(prev => ({ ...prev, error: null }))
  }, [safeSetState])

  return (
    <WalletContext.Provider
      value={{
        ...state,
        freighterInstalled,
        connect,
        disconnect,
        clearError,
        demoMode,
        enableDemoMode
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
