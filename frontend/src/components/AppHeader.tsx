import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';

interface Props {
  onMenuToggle: () => void;
  menuOpen: boolean;
}

export default function AppHeader({ onMenuToggle, menuOpen }: Props) {
  return (
    <header className="flex justify-between items-center py-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-controls="sidebar"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          className="border p-2 md:hidden touch-target"
        >
          ☰
        </button>
        <h1 className="text-2xl font-bold">AI Powered Help Desk</h1>
      </div>
      <nav className="hidden md:block">
        <a href="/chat.html" className="text-blue-600 hover:underline mr-4">
          AI Chat
        </a>
        <a href="/realtime.html" className="text-blue-600 hover:underline mr-4">
          Real-Time
        </a>
        <Link to="/analytics" className="text-blue-600 hover:underline mr-4">
          Analytics
        </Link>
        <Link to="/settings" className="text-blue-600 hover:underline">
          Settings
        </Link>
      </nav>
      <ThemeToggle />
    </header>
  );
}
