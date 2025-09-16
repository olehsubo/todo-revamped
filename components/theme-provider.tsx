'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

const STORAGE_KEY = 'todo-theme';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (next: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(next: Theme) {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  root.dataset.theme = next;
  root.style.colorScheme = next;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document !== 'undefined') {
      const attr = document.documentElement.dataset.theme;
      return attr === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let storedTheme: string | null = null;
    try {
      storedTheme = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Ignore storage access errors (e.g. private browsing)
    }

    const systemMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const systemPrefersDark = systemMedia.matches;
    const preferred: Theme =
      storedTheme === 'dark' || storedTheme === 'light'
        ? storedTheme
        : systemPrefersDark
        ? 'dark'
        : 'light';

    setThemeState(preferred);
    applyTheme(preferred);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        const value = event.newValue === 'dark' ? 'dark' : 'light';
        setThemeState(value);
        applyTheme(value);
      }
    };

    window.addEventListener('storage', handleStorage);
    const handleSystemChange = (event: MediaQueryListEvent) => {
      if (!storedTheme) {
        const value = event.matches ? 'dark' : 'light';
        setThemeState(value);
        applyTheme(value);
      }
    };

    systemMedia.addEventListener('change', handleSystemChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      systemMedia.removeEventListener('change', handleSystemChange);
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    if (typeof window === 'undefined') {
      return;
    }
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore write failures, e.g. private mode
    }
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setThemeState((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore write failures, e.g. private mode
      }
      applyTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () =>
      ({
        theme,
        setTheme,
        toggleTheme
      } satisfies ThemeContextValue),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
