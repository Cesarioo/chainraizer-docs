'use client'

import { createConfig, WagmiConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { http } from 'viem'
import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createStorage, cookieStorage } from 'wagmi'
import { coinbaseWallet, injected } from 'wagmi/connectors'

const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http()
  },
  connectors: [
    injected({
      shimDisconnect: true
    }),
    coinbaseWallet({ 
      appName: 'Raizer',
      headlessMode: false
    })
  ],
  storage: createStorage({
    storage: cookieStorage
  }),
  syncConnectedChain: true
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>{children}</WagmiConfig>
    </QueryClientProvider>
  )
} 