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
  // Récupérer le basePath depuis la variable d'environnement
  // En développement local, cette variable peut être vide, donc on utilise une chaîne vide
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  // Construire le chemin complet pour les polices
  const oliverPath = basePath ? `${basePath}/Oliver-Regular.ttf` : '/Oliver-Regular.ttf'
  const figtreePath = basePath ? `${basePath}/Figtree-Bold.ttf` : '/Figtree-Bold.ttf'
  
  return (
    <html lang="fr">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root { 
              --base-path: '${basePath}';
            }
            @font-face {
              font-family: 'Oliver Regular';
              src: url('${oliverPath}') format('truetype');
              font-weight: normal;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'Figtree Bold';
              src: url('${figtreePath}') format('truetype');
              font-weight: 700;
              font-style: normal;
              font-display: swap;
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  )
}

