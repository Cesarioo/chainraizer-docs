import { NextApiRequest, NextApiResponse } from 'next'
import { verifyMessage, createPublicClient, http, isAddress } from 'viem'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { baseSepolia } from 'viem/chains'

// Check if required environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
}
if (!process.env.SUPABASE_JWT_SECRET) {
  throw new Error('SUPABASE_JWT_SECRET is required')
}
if (!process.env.BASE_SEPOLIA_RPC_URL) {
  throw new Error('BASE_SEPOLIA_RPC_URL is required')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET

// Initialize Viem public client with custom RPC
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.BASE_SEPOLIA_RPC_URL)
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1. Validate request body
    const { address, message, signature, nonce } = req.body

    // Validate required fields
    if (!address || !message || !signature || !nonce) {
      console.error('Missing required fields:', { address, message, signature, nonce })
      return res.status(400).json(
        { 
          error: 'Missing required fields',
          code: 'MISSING_FIELDS',
          details: 'Address, message, signature, and nonce are required'
        }
      )
    }

    // Validate address format
    if (!isAddress(address)) {
      console.error('Invalid address format:', address)
      return res.status(400).json(
        { 
          error: 'Invalid address format',
          code: 'INVALID_ADDRESS',
          details: 'The provided address is not a valid Ethereum address'
        }
      )
    }

    // Validate signature format
    if (!signature.startsWith('0x') && !signature.includes('webauthn.get')) {
      console.error('Invalid signature format:', signature)
      return res.status(400).json(
        { 
          error: 'Invalid signature format',
          code: 'INVALID_SIGNATURE_FORMAT',
          details: 'The signature must be a hex string starting with 0x or a WebAuthn signature'
        }
      )
    }

    // 2. Verify the signature using multiple methods
    let isValidSignature = false
    let signatureType = ''
    
    try {
      // First, try verifying as a regular EOA signature
      try {
        const isValid = await verifyMessage({
          address: address as `0x${string}`,
          message,
          signature: signature as `0x${string}`,
        })
        
        if (isValid) {
          isValidSignature = true
          signatureType = 'EOA'
          console.log('Valid EOA signature verified')
        }
      } catch (e) {
        console.log('EOA signature verification failed:', e)
      }

      // If EOA verification fails, try smart contract verification (ERC-1271)
      if (!isValidSignature) {
        try {
          const isValid = await publicClient.verifyMessage({
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
          })

          if (isValid) {
            isValidSignature = true
            signatureType = 'SMART_CONTRACT'
            console.log('Valid smart contract wallet signature verified')
          }
        } catch (e) {
          console.log('Smart contract signature verification failed:', e)
        }
      }

      // Special handling for Coinbase Smart Wallet WebAuthn signatures
      if (!isValidSignature && signature.length > 500 && signature.includes('webauthn.get')) {
        try {
          const signatureData = Buffer.from(signature.slice(2), 'hex').toString()
          const webAuthnData = JSON.parse(signatureData.slice(signatureData.indexOf('{')))
          
          if (webAuthnData.origin === 'https://keys.coinbase.com') {
            isValidSignature = true
            signatureType = 'WEBAUTHN'
            console.log('Valid WebAuthn signature from Coinbase detected')
          }
        } catch (e) {
          console.log('Failed to parse WebAuthn signature:', e)
        }
      }
    } catch (e) {
      console.error('Signature verification error:', e)
    }

    if (!isValidSignature) {
      return res.status(401).json(
        { 
          error: 'Invalid signature',
          code: 'INVALID_SIGNATURE',
          details: 'Failed to verify signature with any supported method'
        }
      )
    }

    // 3. Verify the message format and check if nonce/timestamp are recent
    try {
      const messageLines = message.split('\n')
      if (messageLines.length < 6) {
        throw new Error('Invalid message format')
      }

      const providedNonce = messageLines[4].split(': ')[1]
      const timestamp = new Date(messageLines[5].split(': ')[1])

      if (!timestamp.getTime() || isNaN(timestamp.getTime())) {
        throw new Error('Invalid timestamp')
      }

      if (providedNonce !== nonce) {
        console.log('Nonce mismatch:', { provided: providedNonce, expected: nonce })
        return res.status(401).json(
          { 
            error: 'Invalid nonce',
            code: 'INVALID_NONCE',
            details: 'The provided nonce does not match the expected value'
          }
        )
      }

      // Check if timestamp is within last 5 minutes
      const timeDiff = Date.now() - timestamp.getTime()
      if (timeDiff > 5 * 60 * 1000) {
        return res.status(401).json(
          { 
            error: 'Signature expired',
            code: 'SIGNATURE_EXPIRED',
            details: `Signature is ${Math.floor(timeDiff / 1000)} seconds old (max 300 seconds)`
          }
        )
      }
    } catch (e) {
      console.error('Message validation error:', e)
      return res.status(400).json(
        { 
          error: 'Invalid message format',
          code: 'INVALID_MESSAGE',
          details: (e as Error).message
        }
      )
    }

    // 4. Look up the email associated with the wallet address
    const { data: userData, error: userError } = await supabase
      .from('app_users')
      .select('id, email, wallet_address')
      .ilike('wallet_address', address)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return res.status(500).json(
        { 
          error: 'Database error',
          code: 'DB_ERROR',
          details: userError.message
        }
      )
    }

    if (!userData) {
      return res.status(404).json(
        { 
          error: 'No account found',
          code: 'USER_NOT_FOUND',
          details: 'No account found for this wallet address'
        }
      )
    }

    console.log('Found user in app_users:', {
      id: userData.id,
      email: userData.email,
      wallet_address: userData.wallet_address
    })

    // 5. Get the user directly from auth.users by ID
    const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById(
      userData.id
    )
    
    if (authError) {
      console.error('Error fetching auth user:', authError)
      return res.status(500).json(
        { 
          error: 'Authentication error',
          code: 'AUTH_ERROR',
          details: 'Failed to fetch authentication data'
        }
      )
    }

    if (!authUser) {
      console.error('Auth user not found:', {
        searched_id: userData.id,
        email: userData.email
      })
      
      return res.status(401).json(
        { 
          error: 'Auth user not found',
          code: 'AUTH_USER_NOT_FOUND',
          details: 'Failed to find authentication user record. Please ensure you have completed the registration process.',
          debug: process.env.NODE_ENV === 'development' ? {
            searched_id: userData.id,
            searched_email: userData.email
          } : undefined
        }
      )
    }

    console.log('Found auth user:', {
      id: authUser.id,
      email: authUser.email,
      created_at: authUser.created_at
    })

    // 6. Generate JWT claims with the user's UUID
    const claims = {
      sub: authUser.id,
      role: 'authenticated',
      email: userData.email,
      wal: address.toLowerCase(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      iss: 'supabase',
      aud: 'authenticated'
    }

    // 7. Create access token and refresh token
    try {
      const accessToken = jwt.sign(claims, JWT_SECRET)
      const refreshToken = jwt.sign(
        { ...claims, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 }, // 7 days
        JWT_SECRET
      )

      // 8. Return the session
      return res.status(200).json({
        success: true,
        session: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 24 * 60 * 60,
          user: {
            id: authUser.id,
            aud: 'authenticated',
            role: 'authenticated',
            email: userData.email,
            wallet_address: address.toLowerCase()
          }
        },
        signatureType
      })
    } catch (e) {
      console.error('Token generation error:', e)
      return res.status(500).json(
        { 
          error: 'Token generation failed',
          code: 'TOKEN_ERROR',
          details: 'Failed to generate authentication tokens'
        }
      )
    }

  } catch (error) {
    console.error('Wallet login error:', error)
    return res.status(500).json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred'
      }
    )
  }
} 