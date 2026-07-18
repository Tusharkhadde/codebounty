'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { WalletState } from '@/types'
import {
  isConnected,
  requestAccess,
  getAddress,
  getNetwork,
} from '@stellar/freighter-api'

interface WalletContextType extends WalletState {
  freighterInstalled: boolean
  connect: () => Promise<void>
  disconnect: () => void
  clearError: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    network: 'futurenet',
    connecting: false,
    error: null,
  })
  const [freighterInstalled, setFreighterInstalled] = useState<boolean>(true)

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, connecting: true, error: null }))

    try {
      const { isConnected: alreadyConnected } = await isConnected().catch(() => ({
        isConnected: false,
      }))

      let address: string | undefined
      if (!alreadyConnected) {
        const res = await requestAccess()
        address = res.address
        if (!address) throw new Error('Wallet access was not granted.')
      } else {
        const res = await getAddress()
        address = res.address
      }

      if (!address) throw new Error('Wallet access was not granted.')

      let network = 'futurenet'
      try {
        const netRes = await getNetwork()
        network = netRes.network || 'futurenet'
      } catch {
        // Keep default network if the call is unsupported.
      }

      setState({
        connected: true,
        address,
        network,
        connecting: false,
        error: null,
      })
      setFreighterInstalled(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet'
      const notInstalled =
        /freighter is not installed|not installed|not detected/i.test(message)
      setFreighterInstalled(!notInstalled)
      setState(prev => ({
        ...prev,
        connected: false,
        connecting: false,
        error: notInstalled
          ? 'Freighter is not installed. Install it to connect a Stellar wallet.'
          : message,
      }))
      throw err
    }
  }, [])

  const disconnect = useCallback(() => {
    setState({
      connected: false,
      address: null,
      network: 'futurenet',
      connecting: false,
      error: null,
    })
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return (
    <WalletContext.Provider
      value={{ ...state, freighterInstalled, connect, disconnect, clearError }}
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
