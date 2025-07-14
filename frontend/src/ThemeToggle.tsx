import { useEffect, useState } from 'react';

export default function ThemeToggle() {
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

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'd') {
        setTheme(t => (t === 'light' ? 'dark' : 'light'));
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <button
      id="themeToggle"
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="ml-4"
    >
      🌓
    </button>
  );
}
