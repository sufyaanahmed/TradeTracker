/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Disable static exports for serverless functions
  output: undefined,
};

module.exports = nextConfig; 