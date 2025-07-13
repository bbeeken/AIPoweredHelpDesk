import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    sidebar.setAttribute('tabindex', '-1');
    if (open) {
      sidebar.focus();
    } else {
      btnRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        aria-label="Toggle navigation"
        aria-controls="sidebar"
        aria-expanded={open}
        className="border p-2 md:hidden"
        onClick={() => setOpen(o => !o)}
      >
        ☰
      </button>
      <nav
        id="sidebar"
        ref={sidebarRef}
        aria-label="Sidebar"
        className={`fixed inset-y-0 left-0 w-56 bg-gray-100 dark:bg-gray-900 p-4 transform transition-transform md:static md:translate-x-0 md:w-48 ${open ? '' : '-translate-x-full'}`}
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
        </ul>
      </nav>
    </>
  );
}
