import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { Providers } from '@/components/Providers'
import ErrorBoundary from '@/components/ErrorBoundary'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CookLens - Découvrez des recettes avec vos ingrédients',
  description: 'Prenez une photo de votre frigo et découvrez des recettes personnalisées avec l\'IA. Détection automatique d\'ingrédients et génération de recettes intelligentes.',
  keywords: ['recettes', 'IA', 'cuisine', 'ingrédients', 'frigo', 'chef', 'cooking', 'artificial intelligence'],
  authors: [{ name: 'CookLens' }],
  creator: 'CookLens',
  publisher: 'CookLens',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://cooklens.vercel.app',
    title: 'CookLens - Découvrez des recettes avec vos ingrédients',
    description: 'Prenez une photo de votre frigo et découvrez des recettes personnalisées avec l\'IA',
    siteName: 'CookLens',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CookLens - Découvrez des recettes avec vos ingrédients',
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
    <ClerkProvider
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
    >
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
    </ClerkProvider>
  )
}
