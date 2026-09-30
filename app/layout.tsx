import type { Metadata } from 'next'
import './globals.css'
import FontLoader from '@/components/FontLoader'

export const metadata: Metadata = {
  title: 'Twitch Chat',
  description: 'Application de chat Twitch en temps réel',
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root { 
              --base-path: '${process.env.NEXT_PUBLIC_BASE_PATH || ''}';
            }
          `
        }} />
      </head>
      <body>
        <FontLoader />
        {children}
      </body>
    </html>
  )
}

