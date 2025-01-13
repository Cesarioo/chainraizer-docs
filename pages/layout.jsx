import { Inter } from 'next/font/google'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import Head from 'next/head'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

const navbar = (
  <Navbar
    logo={<b>Documentation</b>}
  />
)
const footer = <Footer>MIT {new Date().getFullYear()} © Your Name.</Footer>

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <title>My Nextra Docs</title>
        <meta name="description" content="Documentation site built with Nextra" />
      </Head>
      <body className={inter.className}>
        <Layout
          navbar={navbar}
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
} 