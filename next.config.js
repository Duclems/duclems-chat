/** @type {import('next').NextConfig} */
// Détection automatique de l'environnement
// En développement (npm run dev) : pas de basePath
// En production (build pour GitHub Pages) : basePath /duclems-chat
const isDevelopment = process.env.NODE_ENV === 'development'
const basePath = isDevelopment 
  ? '' 
  : (process.env.NEXT_PUBLIC_BASE_PATH !== undefined ? process.env.NEXT_PUBLIC_BASE_PATH : '/duclems-chat')

const nextConfig = {
  reactStrictMode: true,
  // Export statique requis pour GitHub Pages
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Configuration pour GitHub Pages - basePath doit correspondre au nom du dépôt
  // Si votre dépôt est "duclems-chat", l'URL sera: https://username.github.io/duclems-chat/
  // En développement, basePath est vide pour accéder à http://localhost:3000/
  basePath: basePath,
  // assetPrefix pour les assets statiques (images, fonts, etc.)
  assetPrefix: basePath,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig

