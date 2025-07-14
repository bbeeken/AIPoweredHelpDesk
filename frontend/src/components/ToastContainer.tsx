import { useEffect, useState } from 'react';

interface Toast {
  id: number;
  message: string;
}

function ToastItem({ toast, remove }: { toast: Toast; remove: () => void }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setProgress(0));
    const timer = setTimeout(remove, 4000);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [remove]);

  return (
    <div
      role="status"
      className="relative bg-black text-white px-3 py-2 rounded shadow overflow-hidden"
    >
      {toast.message}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-1 bg-white"
        style={{ width: `${progress}%`, transition: 'width 4s linear' }}
      />
    </div>
  );
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
        <ToastItem
          key={t.id}
          toast={t}
          remove={() =>
            setToasts(current => current.filter(toast => toast.id !== t.id))
          }
        />
      ))}
    </div>
  );
}
