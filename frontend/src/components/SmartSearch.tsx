import { useEffect, useState } from 'react';

interface Ticket { id: number; question: string; }

export default function SmartSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Ticket[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!open || !query) return;
    const controller = new AbortController();
    fetch(`/tickets/vector-search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then(res => res.json())
      .then(setResults)
      .catch(() => {});
    return () => controller.abort();
  }, [query, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4" onClick={() => setOpen(false)}>
      <div className="bg-white dark:bg-gray-800 p-4 rounded w-full max-w-xl" onClick={e => e.stopPropagation()}>
        <input
          autoFocus
          className="border p-2 w-full mb-2"
          placeholder="Search..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <ul>
          {results.map(r => (
            <li key={r.id} className="p-1 border-b last:border-0">
              {r.question}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
