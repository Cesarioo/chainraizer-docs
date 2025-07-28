import nextra from 'nextra'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx'
})

const nextConfig = {
  // Allow cross-origin requests for mobile and network development
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
    async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  }
}

export default withNextra(nextConfig)