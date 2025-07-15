import { createContext, useContext, useEffect, useState } from 'react';
import { theme as antdTheme } from 'antd';

const { defaultAlgorithm, darkAlgorithm } = antdTheme;

interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggle: () => void;
  algorithm: typeof defaultAlgorithm;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggle: () => {},
  algorithm: defaultAlgorithm,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));
  const algorithm = theme === 'dark' ? darkAlgorithm : defaultAlgorithm;

  return (
    <ThemeContext.Provider value={{ theme, toggle, algorithm }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
