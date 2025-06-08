import React from 'react'
import type { AppProps } from 'next/app'
import { NextUIProvider } from '@nextui-org/react'
import { AuthProvider } from '../hooks/useAuth'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider>
      <AuthProvider>
      <div className="dark text-foreground bg-background min-h-screen">
        <Component {...pageProps} />
      </div>
      </AuthProvider>
    </NextUIProvider>
  )
} 