import { AppProps } from 'next/app'
import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/AuthContext'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <AuthProvider>
          <div className="text-foreground bg-background min-h-screen transition-colors duration-200">
            <Component {...pageProps} />
          </div>
        </AuthProvider>
      </NextThemesProvider>
    </NextUIProvider>
  )
} 