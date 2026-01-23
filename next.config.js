/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuration pour GitHub Pages - basePath doit correspondre au nom du dépôt
  // Si votre dépôt est "duclems-chat", l'URL sera: https://username.github.io/duclems-chat/
  // Si votre dépôt est "username.github.io", mettez basePath: '' ou supprimez cette ligne
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/duclems-chat',
  // assetPrefix pour les assets statiques (images, fonts, etc.)
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '/duclems-chat',
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

