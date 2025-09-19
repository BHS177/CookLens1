'use client'

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function TestAuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Test d&apos;authentification Clerk
        </h1>
        
        <div className="space-y-4">
          <SignedOut>
            <div className="text-center space-y-4">
              <p className="text-gray-600">Vous n&apos;êtes pas connecté</p>
              <div className="space-y-2">
                <SignInButton mode="modal">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Se connecter
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    S&apos;inscrire
                  </button>
                </SignUpButton>
              </div>
            </div>
          </SignedOut>
          
          <SignedIn>
            <div className="text-center space-y-4">
              <p className="text-gray-600">Vous êtes connecté !</p>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-12 h-12"
                  }
                }}
              />
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  )
}
