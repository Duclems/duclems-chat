import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Twitch Chat',
  description: 'Application de chat Twitch en temps réel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Récupérer le basePath depuis la variable d'environnement ou utiliser la valeur par défaut
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/duclems-chat'
  
  return (
    <html lang="fr">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root { 
              --base-path: '${basePath}';
              --font-oliver: url('${basePath}/Oliver-Regular.ttf');
              --font-figtree: url('${basePath}/Figtree-Bold.ttf');
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  )
}

