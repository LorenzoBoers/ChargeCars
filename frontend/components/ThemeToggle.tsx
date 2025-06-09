import React, { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { 
  SunIcon, 
  MoonIcon 
} from '@heroicons/react/24/outline';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'flat' | 'solid' | 'light' | 'bordered' | 'ghost';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'md', 
  variant = 'flat',
  className = ''
}) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button 
        isIconOnly 
        size={size} 
        variant={variant}
        className={className}
        isDisabled
      >
        <div className="w-4 h-4 bg-foreground/20 rounded animate-pulse" />
      </Button>
    );
  }

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <Button
      isIconOnly
      size={size}
      variant={variant}
      onPress={toggleTheme}
      className={`${className} transition-all duration-200 hover:scale-105`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? (
        <SunIcon className="h-4 w-4 text-amber-500" />
      ) : (
        <MoonIcon className="h-4 w-4 text-slate-600" />
      )}
    </Button>
  );
};

export default ThemeToggle; 