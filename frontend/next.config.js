/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for hosting on Hostinger
  output: 'export',
  
  // Disable server-side features that don't work with static export
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Configure images for static export
  images: {
    unoptimized: true
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
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
  }
}

module.exports = nextConfig 