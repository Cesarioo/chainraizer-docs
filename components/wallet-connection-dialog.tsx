'use client'

import { useState, useEffect, Suspense } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { useConnect, useSwitchChain, useSignMessage, useAccount } from 'wagmi'
import { coinbaseWallet, injected } from 'wagmi/connectors'
import { baseSepolia } from 'wagmi/chains'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Input } from "./ui/input"
import { useSearchParams } from 'next/navigation'

// Initialize Supabase client
const supabase = createClientComponentClient()

interface WalletConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'sign-in' | 'sign-up' | 'sign'
  onWalletAuthenticated?: (address: string, message: string, signature: string, nonce: string) => void
}

function WalletConnectionDialogContent({ 
  open, 
  onOpenChange, 
  mode, 
  onWalletAuthenticated
}: WalletConnectionDialogProps) {
  const { connectAsync } = useConnect()
  const { switchChainAsync } = useSwitchChain()
  const { signMessageAsync } = useSignMessage()
  const { address } = useAccount()
  const searchParams = useSearchParams()
  const referralUsername = searchParams.get("ref") ? decodeURIComponent(searchParams.get("ref")!) : null

  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')
  const [nonce] = useState(() => Math.random().toString(36).substring(2, 15))
  const [referralCode, setReferralCode] = useState('')
  const [inviterId, setInviterId] = useState('')

  // Handle referral auto-fill
  useEffect(() => {
    const fetchReferrer = async () => {
      if (referralUsername) {
        console.log("Wallet Dialog - Attempting to fetch referrer:", referralUsername)
        try {
          const { data, error } = await supabase
            .rpc('search_users_by_pseudonym', {
              search_term: referralUsername
            })

          if (error) {
            console.error('Wallet Dialog - Supabase RPC Error:', error)
            throw error
          }
          
          console.log("Wallet Dialog - Search results:", data)
          
          if (Array.isArray(data) && data.length > 0) {
            const referrer = data[0]
            console.log("Wallet Dialog - Found referrer:", referrer)
            setReferralCode(referrer.pseudonym)
            setInviterId(referrer.id)
          } else {
            console.log("Wallet Dialog - No referrer found for username:", referralUsername)
          }
        } catch (error) {
          console.error('Wallet Dialog - Error fetching referrer:', error)
        }
      }
    }

    if (mode === 'sign-up' && referralUsername) {
      fetchReferrer()
    }
  }, [referralUsername, mode, supabase])

  const handleSign = async (walletAddress: string) => {
    try {
      if (mode === 'sign-up' && !referralCode) {
        setError('Referral code is required')
        return
      }

      const timestamp = new Date().toISOString()
      const message = `${mode === 'sign-up' ? 'Sign up' : 'Sign in'} to Raizer\n\nWallet: ${walletAddress}\nChain: Base Sepolia\nNonce: ${nonce}\nTimestamp: ${timestamp}`
      
      const signature = await signMessageAsync({ 
        message,
        account: walletAddress as `0x${string}`
      })

      // Use the appropriate API endpoint based on mode
      const endpoint = mode === 'sign-up' ? '/api/wallet-signup' : '/api/wallet-auth'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          address: walletAddress,
          message,
          signature,
          nonce,
          ...(mode === 'sign-up' ? { 
            referralCode,
            inviterId 
          } : {})
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // For 'sign' mode, just close the modal if it's a database error
        if (mode === 'sign' && data.error === 'Database error') {
          onOpenChange(false)
          return
        }
        throw new Error(data.error || `Failed to ${mode === 'sign-up' ? 'create account' : 'authenticate'} with wallet`)
      }

      // Set the session in the client only for sign-in and sign-up modes
      if (mode !== 'sign') {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })

        if (setSessionError) {
          throw setSessionError
        }
      }

      // Call the callback with the wallet data
      onWalletAuthenticated?.(walletAddress, message, signature, nonce)
      onOpenChange(false)

      // Redirect to onboarding if signing up with wallet
      if (mode === 'sign-up') {
        window.location.href = '/onboarding'
      }

    } catch (error) {
      console.error("Error signing message:", error)
      setError(error instanceof Error ? error.message : 'Failed to authenticate wallet. Please try again.')
    }
  }

  const handleConnect = async (type: 'coinbase' | 'metamask' | 'rabby') => {
    setIsConnecting(true)
    setError('')

    try {
      let connector
      if (type === 'coinbase') {
        connector = coinbaseWallet({ 
          appName: 'Raizer'})
      } else {
        connector = injected({ 
          shimDisconnect: true
        })
      }

      const result = await connectAsync({ connector })
      const connectedAddress = result.accounts[0]

      if (connectedAddress) {
        try {
          if (result.chainId !== baseSepolia.id) {
            await switchChainAsync({ chainId: baseSepolia.id })
          }
          await handleSign(connectedAddress)
        } catch (error) {
          console.error("Error during chain switch or signing:", error)
          if (error instanceof Error) {
            if (error.message.includes('user rejected')) {
              setError('Transaction was rejected. Please try again.')
            } else {
              setError('Please switch to Base Sepolia network manually')
            }
          }
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          setError('Connection was rejected. Please try again.')
        } else {
          setError('Failed to connect wallet. Please try again.')
        }
      }
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-4 sm:p-8 max-w-[95vw] mx-auto rounded-lg border-none">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-xl sm:text-2xl font-semibold">Connect Wallet</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {mode === 'sign-up' 
              ? 'Connect your wallet to create a new account on Raizer.'
              : mode === 'sign-in' 
                ? 'Connect your wallet to sign in to your account.'
                : 'Connect your wallet to sign in to your account.'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'sign-up' && (
          <div className="space-y-2 mb-4">
            <label htmlFor="referral" className="text-sm font-medium">
              Who invited you?
            </label>
            <Input
              value={referralCode}
              onChange={(e) => {
                setReferralCode(e.target.value)
                setInviterId('')
              }}
              disabled={!!referralUsername && !!referralCode}
            />
          </div>
        )}

        <div className="grid gap-4 sm:gap-6 py-2 sm:py-4">
          {/* Raizer Wallet Button with special styling */}
          <Button
            variant="outline"
            className="relative flex items-center justify-start h-14 sm:h-16 px-4 sm:px-6 gap-3 sm:gap-4 w-full hover:bg-gray-50 border-none before:absolute before:inset-0 before:p-[2px] before:rounded-xl before:bg-[linear-gradient(90deg,theme(colors.blue.400),theme(colors.cyan.400),theme(colors.sky.400),theme(colors.blue.400))] before:bg-[length:200%_auto] before:animate-gradient-move overflow-hidden group shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-shadow duration-300"
            onClick={() => handleConnect('coinbase')}
            disabled={isConnecting}
          >
            <div className="absolute inset-[2px] bg-white dark:bg-black rounded-xl group-hover:bg-gray-50 dark:group-hover:bg-gray-900 transition-colors" />
            <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex items-center justify-center z-10">
              <img
                src="https://play-lh.googleusercontent.com/wrgUujbq5kbn4Wd4tzyhQnxOXkjiGqq39N4zBvCHmxpIiKcZw_Pb065KTWWlnoejsg"
                alt="Raizer Wallet"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="flex-grow flex flex-col items-start z-10">
              <span className="font-semibold text-base sm:text-lg">Coinbase Smart Wallet</span>
              <span className="text-xs sm:text-sm text-gray-500">Advanced Features</span>
            </div>
          </Button>

          {/* MetaMask Button */}
          <Button
            variant="outline"
            className="flex items-center justify-start h-14 sm:h-16 px-4 sm:px-6 gap-3 sm:gap-4 w-full hover:bg-gray-50/80 rounded-xl border border-gray-200 dark:border-gray-800"
            onClick={() => handleConnect('metamask')}
            disabled={isConnecting}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex items-center justify-center">
              <img
                src="https://pub-44b2544c34a4482595a3ab438ff68918.r2.dev/metamask.png"
                alt="MetaMask"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-grow flex flex-col items-start">
              <span className="font-semibold text-base sm:text-lg">MetaMask</span>
              <span className="text-xs sm:text-sm text-gray-500">Popular choice</span>
            </div>
          </Button>

          {/* Rabby Wallet Button */}
          <Button
            variant="outline"
            className="flex items-center justify-start h-14 sm:h-16 px-4 sm:px-6 gap-3 sm:gap-4 w-full hover:bg-gray-50/80 rounded-xl border border-gray-200 dark:border-gray-800"
            onClick={() => handleConnect('rabby')}
            disabled={isConnecting}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex items-center justify-center">
              <img
                src="https://pub-44b2544c34a4482595a3ab438ff68918.r2.dev/rabby.png"
                alt="Rabby Wallet"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-grow flex flex-col items-start">
              <span className="font-semibold text-base sm:text-lg">Rabby Wallet</span>
              <span className="text-xs sm:text-sm text-gray-500">Popular Choice</span>
            </div>
          </Button>

          {error && <p className="text-xs sm:text-sm text-red-500 text-center mt-3 sm:mt-4">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function WalletConnectionDialog(props: WalletConnectionDialogProps) {
  return (
    <Suspense fallback={
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className="sm:max-w-[550px] p-4 sm:p-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    }>
      <WalletConnectionDialogContent {...props} />
    </Suspense>
  )
} 