import type { AppProps } from 'next/app'
import { HeroUIProvider } from '@heroui/react'
import { ThemeProvider } from 'next-themes'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      value={{
        light: 'light',
        dark: 'dark'
      }}
    >
      <HeroUIProvider>
        <div className="text-foreground bg-background min-h-screen transition-colors duration-200">
          <Component {...pageProps} />
        </div>
      </HeroUIProvider>
    </ThemeProvider>
  )
} 