import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { Providers } from '@/components/Providers'
import ErrorBoundary from '@/components/ErrorBoundary'
import { LanguageProvider } from '@/contexts/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fridge AI - Découvrez des recettes avec vos ingrédients',
  description: 'Prenez une photo de votre frigo et découvrez des recettes personnalisées avec l\'IA. Détection automatique d\'ingrédients et génération de recettes intelligentes.',
  keywords: ['recettes', 'IA', 'cuisine', 'ingrédients', 'frigo', 'chef', 'cooking', 'artificial intelligence'],
  authors: [{ name: 'Fridge AI' }],
  creator: 'Fridge AI',
  publisher: 'Fridge AI',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://fridge-ai.vercel.app',
    title: 'Fridge AI - Découvrez des recettes avec vos ingrédients',
    description: 'Prenez une photo de votre frigo et découvrez des recettes personnalisées avec l\'IA',
    siteName: 'Fridge AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fridge AI - Découvrez des recettes avec vos ingrédients',
    description: 'Prenez une photo de votre frigo et découvrez des recettes personnalisées avec l\'IA',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <ErrorBoundary>
          <LanguageProvider>
            <Providers>
              <div className="min-h-screen flex flex-col">
                <Navigation />
                <main className="flex-1">
                  {children}
                </main>
              </div>
            </Providers>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
