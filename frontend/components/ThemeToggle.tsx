import React from 'react';
import { Button } from '@nextui-org/react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  showLabel?: boolean;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'md', 
  variant = 'ghost',
  showLabel = false,
  className = ''
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onPress={toggleTheme}
      startContent={
        isDark ? (
          <SunIcon className="h-4 w-4" />
        ) : (
          <MoonIcon className="h-4 w-4" />
        )
      }
      className={`
        transition-all duration-200 
        ${isDark 
          ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10' 
          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-600/10'
        }
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {showLabel && (
        <span className="hidden sm:inline">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </Button>
  );
};

export default ThemeToggle; 