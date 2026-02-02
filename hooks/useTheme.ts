'use client';

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'default' | 'dark' | 'blue' | 'green' | 'purple' | 'retro' | 'minimal';

interface ThemeConfig {
  name: string;
  icon: string;
  description: string;
  colors: {
    background: string;
    cardBg: string;
    border: string;
    text: string;
    accent: string;
    success: string;
    error: string;
    warning: string;
  };
}

const THEMES: Record<Theme, ThemeConfig> = {
  default: {
    name: 'Standard',
    icon: '🌟',
    description: 'Klassisk blå-lila gradient',
    colors: {
      background: 'bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900',
      cardBg: 'bg-black/20 backdrop-blur-sm',
      border: 'border-white/10',
      text: 'text-white',
      accent: 'text-blue-400',
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
    },
  },
  dark: {
    name: 'Mörk',
    icon: '🌙',
    description: 'Djup svart tema',
    colors: {
      background: 'bg-gradient-to-br from-gray-900 via-black to-gray-800',
      cardBg: 'bg-gray-800/40 backdrop-blur-sm',
      border: 'border-gray-600/30',
      text: 'text-gray-100',
      accent: 'text-gray-300',
      success: 'text-emerald-400',
      error: 'text-rose-400',
      warning: 'text-amber-400',
    },
  },
  blue: {
    name: 'Ocean',
    icon: '🌊',
    description: 'Djupblå havstemå',
    colors: {
      background: 'bg-gradient-to-br from-blue-800 via-cyan-900 to-blue-700',
      cardBg: 'bg-blue-900/30 backdrop-blur-sm',
      border: 'border-cyan-400/20',
      text: 'text-cyan-50',
      accent: 'text-cyan-300',
      success: 'text-teal-400',
      error: 'text-red-300',
      warning: 'text-orange-300',
    },
  },
  green: {
    name: 'Skog',
    icon: '🌲',
    description: 'Naturligt grön tema',
    colors: {
      background: 'bg-gradient-to-br from-green-800 via-emerald-900 to-green-700',
      cardBg: 'bg-green-900/30 backdrop-blur-sm',
      border: 'border-emerald-400/20',
      text: 'text-emerald-50',
      accent: 'text-emerald-300',
      success: 'text-lime-400',
      error: 'text-red-300',
      warning: 'text-yellow-300',
    },
  },
  purple: {
    name: 'Galax',
    icon: '🌌',
    description: 'Rymd-inspirerat tema',
    colors: {
      background: 'bg-gradient-to-br from-purple-900 via-violet-900 to-purple-800',
      cardBg: 'bg-purple-900/30 backdrop-blur-sm',
      border: 'border-violet-400/20',
      text: 'text-violet-50',
      accent: 'text-violet-300',
      success: 'text-pink-400',
      error: 'text-red-300',
      warning: 'text-amber-300',
    },
  },
  retro: {
    name: 'Retro',
    icon: '🕹️',
    description: '80-tals neon tema',
    colors: {
      background: 'bg-gradient-to-br from-pink-900 via-purple-900 to-cyan-900',
      cardBg: 'bg-black/40 backdrop-blur-sm',
      border: 'border-pink-500/30',
      text: 'text-pink-100',
      accent: 'text-pink-400',
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
    },
  },
  minimal: {
    name: 'Minimal',
    icon: '⚪',
    description: 'Rent och enkelt',
    colors: {
      background: 'bg-gradient-to-br from-gray-100 via-white to-gray-50',
      cardBg: 'bg-white/70 backdrop-blur-sm',
      border: 'border-gray-300/50',
      text: 'text-gray-900',
      accent: 'text-gray-600',
      success: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-orange-600',
    },
  },
};

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('default');

  // Load theme from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('typing-game-theme') as Theme;
      if (savedTheme && THEMES[savedTheme]) {
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  // Change theme and save to localStorage
  const changeTheme = useCallback((theme: Theme) => {
    setCurrentTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typing-game-theme', theme);
    }
  }, []);

  // Get current theme configuration
  const getThemeConfig = useCallback(() => THEMES[currentTheme], [currentTheme]);

  // Get all available themes
  const getAllThemes = useCallback(() => {
    return Object.entries(THEMES).map(([key, config]) => ({
      key: key as Theme,
      ...config,
    }));
  }, []);

  // Get theme-specific class names
  const getThemeClasses = useCallback(() => {
    const config = THEMES[currentTheme];
    return {
      background: config.colors.background,
      card: `${config.colors.cardBg} ${config.colors.border} border`,
      text: config.colors.text,
      accent: config.colors.accent,
      success: config.colors.success,
      error: config.colors.error,
      warning: config.colors.warning,
    };
  }, [currentTheme]);

  return {
    currentTheme,
    changeTheme,
    getThemeConfig,
    getAllThemes,
    getThemeClasses,
  };
}