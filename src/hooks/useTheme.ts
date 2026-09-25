import { useState, useEffect } from 'react';
import { ThemeMode } from '../types';
import { getSetting, setSetting } from '../services/db';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('auto');

  useEffect(() => {
    // Load persisted theme
    getSetting<ThemeMode>('theme').then(saved => {
      if (saved) {
        setThemeState(saved);
      }
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark =
        theme === 'dark' || (theme === 'auto' && mediaQuery.matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Update theme color meta tag
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#090d16' : '#4f46e5');
      }
    };

    applyTheme();

    const listener = () => {
      if (theme === 'auto') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    await setSetting('theme', newTheme);
  };

  return { theme, setTheme };
}
