/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure headers for PDF.js worker files
  async headers() {
    return [
      {
        // Match PDF worker files
        source: '/pdf.worker.min.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
