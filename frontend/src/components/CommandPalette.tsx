import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Option {
  label: string;
  path: string;
}

const options: Option[] = [
  { label: 'Dashboard', path: '/' },
  { label: 'Analytics', path: '/analytics' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  function handleSelect(opt: Option) {
    navigate(opt.path);
    setOpen(false);
    setQuery('');
  }

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-24 z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-gray-800 rounded shadow p-4 w-80">
        <input
          autoFocus
          type="text"
          className="border p-2 mb-2 w-full"
          placeholder="Type a command..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <ul>
          {filtered.map(opt => (
            <li key={opt.path}>
              <button
                className="w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => handleSelect(opt)}
              >
                {opt.label}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-2 text-gray-500">No results</li>
          )}
        </ul>
      </div>
    </div>
  );
}
