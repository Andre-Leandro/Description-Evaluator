/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Opcional: Configuración de redirecciones, reescrituras, etc.
  // reactStrictMode: true,
  // swcMinify: true,
  // images: {
  //   domains: ['example.com'],
  // },
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:3001/api/:path*',
  //     },
  //   ]
  // },
}

module.exports = nextConfig
