/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Proxy API requests to Express backend (avoids CORS issues)
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
      {
        source: '/backend/:path*',
        destination: 'http://localhost:4000/:path*',
      },
    ];
  },
  // Allow images from external sources if needed
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/image/**',
      },
    ],
    unoptimized: true, // For GridFS images
  },
  // Output standalone for easier deployment
  output: 'standalone',
};

module.exports = nextConfig;
