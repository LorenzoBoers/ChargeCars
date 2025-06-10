const {nextui} = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        chargecars: {
          // Primary brand colors inspired by ChargeCars
          50: '#f0f9ff',
          100: '#e0f2fe', 
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Main brand blue
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49'
        },
        electric: {
          // Electric green accent
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Electric green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        }
      }
    },
  },
  darkMode: "class",
  plugins: [nextui({
    defaultTheme: "dark",
    themes: {
      light: {
        colors: {
          background: '#ffffff', // Light background
          foreground: '#11181c',
          content1: '#ffffff', // Card backgrounds
          content2: '#f4f4f5', // Secondary card backgrounds  
          content3: '#e4e4e7', // Tertiary backgrounds
          content4: '#d4d4d8',
          default: {
            50: '#fafafa',
            100: '#f4f4f5',
            200: '#e4e4e7',
            300: '#d4d4d8',
            400: '#a1a1aa',
            500: '#71717a',
            600: '#52525b',
            700: '#3f3f46',
            800: '#27272a',
            900: '#18181b',
            DEFAULT: '#f4f4f5',
            foreground: '#11181c'
          },
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9', // ChargeCars brand blue
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
            DEFAULT: '#0ea5e9',
            foreground: '#ffffff'
          },
          secondary: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e', // Electric green
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
            DEFAULT: '#22c55e',
            foreground: '#ffffff'
          },
          success: {
            DEFAULT: '#22c55e',
            foreground: '#ffffff'
          },
          warning: {
            DEFAULT: '#f59e0b',
            foreground: '#ffffff'
          },
          danger: {
            DEFAULT: '#ef4444',
            foreground: '#ffffff'
          }
        },
      },
      dark: {
        colors: {
          background: '#0a0a0a', // Very dark background
          foreground: '#ffffff',
          content1: '#111111', // Card backgrounds
          content2: '#1a1a1a', // Secondary card backgrounds  
          content3: '#222222', // Tertiary backgrounds
          content4: '#2a2a2a',
          default: {
            50: '#18181b',
            100: '#27272a',
            200: '#3f3f46',
            300: '#52525b',
            400: '#71717a',
            500: '#a1a1aa',
            600: '#d4d4d8',
            700: '#e4e4e7',
            800: '#f4f4f5',
            900: '#fafafa',
            DEFAULT: '#27272a',
            foreground: '#fafafa'
          },
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9', // ChargeCars brand blue
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
            DEFAULT: '#0ea5e9',
            foreground: '#ffffff'
          },
          secondary: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e', // Electric green
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
            DEFAULT: '#22c55e',
            foreground: '#ffffff'
          },
          success: {
            DEFAULT: '#22c55e',
            foreground: '#ffffff'
          },
          warning: {
            DEFAULT: '#f59e0b',
            foreground: '#ffffff'
          },
          danger: {
            DEFAULT: '#ef4444',
            foreground: '#ffffff'
          }
        },
      },
    },
  })],
} 