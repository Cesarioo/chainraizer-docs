import { Inter } from 'next/font/google'
import './globals.css'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'next/head'
import 'nextra-theme-docs/style.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'My Nextra Docs',
  description: 'Documentation site built with Nextra'
}

const navbar = (
  <Navbar
    logo={<b>Documentation</b>}
  />
)
const footer = <Footer>MIT {new Date().getFullYear()} © Your Name.</Footer>

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
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