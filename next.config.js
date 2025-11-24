/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingIncludes: {
      'src/app/api/relatorio-pdf/route.ts': [
        './node_modules/playwright-core/.local-browsers/**'
      ],
    },
  },
}

module.exports = nextConfig