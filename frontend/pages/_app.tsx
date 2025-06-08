import React from 'react'
import type { AppProps } from 'next/app'
import { NextUIProvider } from '@nextui-org/react'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider>
      <ThemeProvider>
        <AuthProvider>
          <div className="text-foreground bg-background min-h-screen transition-colors duration-200">
            <Component {...pageProps} />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </NextUIProvider>
  )
} 