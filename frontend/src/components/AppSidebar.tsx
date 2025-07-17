import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AppSidebar({ open, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <nav
      id="sidebar"
      aria-label="Sidebar"
      tabIndex={-1}
      ref={ref}
      className={`fixed inset-y-0 left-0 w-56 bg-gray-100 dark:bg-gray-900 p-4 transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'} md:static md:translate-x-0 md:w-48`}
    >
      <ul className="space-y-2">
        <li>
          <Link to="/" className="block hover:underline">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/analytics" className="block hover:underline">
            Analytics
          </Link>
        </li>
        <li>
          <Link to="/settings" className="block hover:underline">
            Settings
          </Link>
        </li>
      </ul>
    </nav>
  );
}
