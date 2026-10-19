import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // desactivado: todas las paginas dependen del usuario que inicio sesion,
  // no hay nada que se pueda guardar en cache para todos
  cacheComponents: false,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
