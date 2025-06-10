import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  className?: string;
}

const sizeMap = {
  xs: { width: 100, height: 36 },  // New smaller size for sidebar
  sm: { width: 120, height: 43 },
  md: { width: 160, height: 58 },
  lg: { width: 200, height: 72 },
  xl: { width: 320, height: 115 }
};

export default function Logo({ 
  size = 'md', 
  href = '/',
  className = '' 
}: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dimensions = sizeMap[size];
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`flex items-center ${className}`} style={{ width: dimensions.width, height: dimensions.height }}>
        <div className="bg-foreground/10 rounded animate-pulse w-full h-full" />
      </div>
    );
  }

  // Determine which logo to use based on theme
  const logoSrc = (resolvedTheme === 'dark' || theme === 'dark') 
    ? "/images/ChargeCars portal svg dark mode (1).svg"
    : "/images/ChargeCars portal svg light mode (1).svg";
  
  const logoElement = (
    <div className={`flex items-center ${className}`}>
      <Image
        src={logoSrc}
        alt="ChargeCars Portal"
        width={dimensions.width}
        height={dimensions.height}
        priority
        className="h-auto w-auto transition-opacity duration-200"
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <a className="inline-block transition-opacity hover:opacity-80" title="ChargeCars Portal - Dashboard">
          {logoElement}
        </a>
      </Link>
    );
  }

  return logoElement;
} 