/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure headers for PDF.js worker files
  async headers() {
    return [
      {
        // Match all PDF worker files
        source: '/:path*.(js|mjs)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
