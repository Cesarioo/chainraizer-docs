import { Inter } from 'next/font/google'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

export default {
  logo: (
    <div className="flex items-center">
      <Image 
        src="/alpha.png" 
        alt="raizer Logo" 
        width={100} 
        height={150}
        className="h-full w-auto"
      />
    </div>
  ),
  project: {
    link: 'https://github.com/Cesarioo/chainraizer-docs'
  },
  docsRepositoryBase: 'https://github.com/Cesarioo/chainraizer-docs',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – raizer Docs'
    }
  },
  footer: {
    text: `MIT ${new Date().getFullYear()} © raizer.`
  },
 

  navigation: {
    prev: true,
    next: true
  },
  darkMode: true,
 
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
      <meta name="msapplication-TileColor" content="#da532c" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="description" content="The full documentation of Raizer" />
      <title>Raizer Docs</title>
    </>
  ),
  primaryHue: {
    dark: 204,
    light: 212
  },
 

  sidebar: {
    defaultMenuCollapseLevel: 1,
    autoCollapse: true,
    toggleButton: true
  },
 
  font: false,
  useNextSeoProps() {
    return {
      titleTemplate: '%s – My Nextra Docs'
    }
  }
}