'use client';

import { useTheme } from '@/hooks/useTheme';
import { useEffect } from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  // Apply theme to body
  useEffect(() => {
    const body = document.body;

    // Remove all existing theme classes
    body.className = body.className
      .split(' ')
      .filter(cls => !cls.includes('bg-gradient') && !cls.includes('from-') && !cls.includes('via-') && !cls.includes('to-'))
      .join(' ');

    // Add current theme background
    body.className += ` ${themeClasses.background}`;
  }, [themeClasses.background]);

  return <>{children}</>;
}