import Image from 'next/image'

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
    link: 'https://github.com/yourusername/docs-chainraizer'
  },
  docsRepositoryBase: 'https://github.com/yourusername/docs-chainraizer',
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
  primaryHue: {
    dark: 200,
    light: 200
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    autoCollapse: true,
    toggleButton: true
  }
}