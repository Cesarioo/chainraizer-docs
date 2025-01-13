import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default {
  logo: <b>Documentation</b>,
  project: {
    link: 'https://github.com/Cesarioo/chainraizer-docs'
  },
  docsRepositoryBase: 'https://github.com/Cesarioo/chainraizer-docs',
  footer: {
    text: `MIT ${new Date().getFullYear()} © Your Name.`
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Documentation site built with Nextra" />
      <title>My Nextra Docs</title>
    </>
  ),
  primaryHue: {
    dark: 204,
    light: 212
  },
  font: false,
  useNextSeoProps() {
    return {
      titleTemplate: '%s – My Nextra Docs'
    }
  }
}