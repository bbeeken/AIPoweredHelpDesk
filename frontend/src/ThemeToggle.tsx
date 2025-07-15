import { useEffect } from 'react';
import { Switch } from 'antd';
import { useTheme } from './hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'd') toggle();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggle]);

  return (
    <Switch
      id="themeToggle"
      checked={theme === 'dark'}
      onChange={toggle}
      aria-label="Toggle dark mode"
    />
  );
}
