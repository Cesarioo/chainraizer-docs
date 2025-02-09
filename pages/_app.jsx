import '../styles/globals.css'
import 'nextra-theme-docs/style.css'
import { Inter } from 'next/font/google'
import FloatingButton from '../components/FloatingButton'
import { Providers } from '../components/providers'

const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }) {
  return (
    <Providers>
      <main className={inter.className}>
        <Component {...pageProps} />
        <FloatingButton />
      </main>
    </Providers>
  )
} 