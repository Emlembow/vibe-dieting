/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for better performance and reliability
  reactStrictMode: true,
  
  // Optimize images for better performance
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig