/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuración para subdominios dinámicos
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>.*)\\.landingyou\\.com',
          },
        ],
        destination: '/landing/:subdomain/:path*',
      },
    ];
  },
};

module.exports = nextConfig;


