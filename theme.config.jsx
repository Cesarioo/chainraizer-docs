import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default {
  logo: (
    <div className="flex items-center">
      <Image 
        src="/logo.png" 
        alt="ChainRaizer Logo" 
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
      titleTemplate: '%s – ChainRaizer Docs'
    }
  },
  footer: {
    text: `MIT ${new Date().getFullYear()} © ChainRaizer.`
  },
 

  navigation: {
    prev: true,
    next: true
  },
  darkMode: true,
 
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Documentation site built with Nextra" />
      <title>ChainRaizer Docs</title>
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