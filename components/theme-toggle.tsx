'use client';

import { useEffect, useState } from 'react';
import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? theme === 'dark' : false;
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type='button'
      onClick={toggleTheme}
      aria-label={label}
      className='theme-toggle rounded-full px-3 py-1 text-sm font-medium'
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
