import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { useTheme } from '../contexts/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'

export default function HomePage() {
  const router = useRouter()
  const { isDark } = useTheme()

  useEffect(() => {
    // Automatisch doorverwijzen naar dashboard
    router.push('/dashboard')
  }, [router])

  return (
    <>
      <Head>
        <title>ChargeCars - Order Management System</title>
        <meta name="description" content="ChargeCars order management system - professional charging station installations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Theme Toggle */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
        <ThemeToggle size="sm" />
      </div>

      <div style={{
        background: isDark ? '#0a0a0a' : '#f8fafc',
        color: isDark ? '#ffffff' : '#1f2937',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        transition: 'all 0.2s ease'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <Image
            src="/images/ChargeCars portal svg dark mode (1).svg"
            alt="ChargeCars"
            width={320}
            height={115}
            priority
            style={{ 
              filter: isDark ? 'none' : 'brightness(0.9)',
              opacity: isDark ? 1 : 0.9
            }}
          />
        </div>
        
        <div style={{
          color: '#22c55e',
          fontSize: '1.2rem',
          marginBottom: '30px'
        }}>
          Order Management System
        </div>

        <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>
          Wordt doorgestuurd naar dashboard...
        </p>
        
        <p style={{ marginTop: '20px' }}>
          Als je niet automatisch wordt doorgestuurd,{' '}
          <a 
            href="/dashboard" 
            style={{ 
              color: '#0ea5e9', 
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            klik hier
          </a>
        </p>
      </div>
    </>
  )
} 