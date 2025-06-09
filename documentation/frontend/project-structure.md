# ChargeCars Frontend Project Structure

**Last Updated**: 2025-01-09
**Status**: Implemented

## Overview

The ChargeCars frontend is built with Next.js using the Pages Router, TypeScript, and NextUI for the component library.

## Directory Structure

```
frontend/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   │   └── Logo.tsx    # ChargeCars logo component
│   ├── Layout.tsx      # Main layout with navigation
│   ├── OrderManagement.tsx
│   └── ThemeToggle.tsx
│
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── ThemeContext.tsx # Theme management
│
├── hooks/              # Custom React hooks
│   └── useProtectedRoute.tsx
│
├── pages/              # Next.js pages
│   ├── _app.tsx       # App wrapper
│   ├── index.tsx      # Landing page (redirects to dashboard)
│   ├── dashboard.tsx  # Main dashboard
│   ├── orders.tsx     # Order management page
│   └── auth/          # Authentication pages
│       └── login.tsx
│
├── public/             # Static assets
│   └── images/        # Image assets
│       └── ChargeCars portal svg dark mode (1).svg # Logo
│
├── styles/             # Global styles
│   └── globals.css    # Tailwind CSS imports
│
├── lib/                # Utility functions
├── taskmaster-prompts/ # AI generation prompts
│
└── Configuration files
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    └── package.json
```

## Key Components

### Logo Component (`components/ui/Logo.tsx`)
- Reusable logo component with size variants
- Supports linking to different pages
- Uses the official ChargeCars SVG logo

### Layout Component (`components/Layout.tsx`)
- Main layout wrapper with header and footer
- Includes navigation menu
- Shows ChargeCars logo in header
- User profile section

### Pages
- **index.tsx**: Landing page with logo, auto-redirects to dashboard
- **dashboard.tsx**: Main dashboard with user info and order management
- **orders.tsx**: Dedicated order management page

## Technology Stack

- **Framework**: Next.js 13+ (Pages Router)
- **Language**: TypeScript
- **UI Library**: NextUI
- **Styling**: Tailwind CSS
- **Icons**: Heroicons, Lucide React
- **State Management**: React Context API

## Logo Integration

The ChargeCars logo is integrated throughout the app:
1. Landing page (index.tsx) - Large centered logo
2. Layout header - Medium logo with navigation
3. Dashboard - Logo in header section
4. Footer - Small logo with opacity

## Best Practices

1. All pages use the Layout component for consistent navigation
2. Logo component is reusable with different size options
3. Theme support (dark/light mode) is built-in
4. Authentication is handled via AuthContext
5. Protected routes use the useProtectedRoute hook 