/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for production deployment on Hostinger
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  
  // SPA routing for static hosting
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Configure images
  images: {
    unoptimized: true,
    domains: ['api.chargecars.nl', 'xrxc-xsc9-6egu.xano.io']
  },
  
  // Environment variables for Xano API
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.chargecars.nl',
    NEXT_PUBLIC_AUTH_ENDPOINT: process.env.NEXT_PUBLIC_AUTH_ENDPOINT || '/api:auth'
  },

  // Disable TypeScript build errors on production
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Asset optimization
  compress: true,
  
  // Exclude pages with getServerSideProps from export
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    // Remove account and settings pages from export
    const pathMap = { ...defaultPathMap };
    delete pathMap['/account'];
    delete pathMap['/settings'];
    return pathMap;
  },
  
  // Performance optimizations
  // Disabled optimizeCss to avoid critters dependency issue
  // experimental: {
  //   optimizeCss: true,
  // }
}

module.exports = nextConfig 