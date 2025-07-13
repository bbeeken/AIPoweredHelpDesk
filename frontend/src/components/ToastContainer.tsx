import { useEffect, useState } from 'react';

interface Toast {
  id: number;
  message: string;
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!window.EventSource) return;
    const es = new EventSource('/events');

    function addToast(message: string) {
      const id = Date.now() + Math.random();
      setToasts(t => [...t, { id, message }]);
      setTimeout(() => {
        setToasts(t => t.filter(toast => toast.id !== id));
      }, 4000);
    }

    es.addEventListener('ticketCreated', e => addToast('Ticket created: ' + e.data));
    es.addEventListener('ticketUpdated', e => addToast('Ticket updated: ' + e.data));

    return () => es.close();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className="bg-black text-white px-3 py-2 rounded shadow">
          {t.message}
        </div>
      ))}
    </div>
  );
}
