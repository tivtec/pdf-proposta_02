/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
    outputFileTracingIncludes: {
      '/api/relatorio-pdf': [
        './node_modules/@sparticuz/chromium/**',
        './node_modules/@sparticuz/chromium/bin/**',
        './node_modules/puppeteer-core/**',
      ],
    },
  },
}

module.exports = nextConfig