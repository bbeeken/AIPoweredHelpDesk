import { useEffect, useState } from "react";

interface Toast {
  id: number;
  message: string;
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function addToast(message: string) {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message }]);
      setTimeout(() => {
        setToasts((t) => t.filter((toast) => toast.id !== id));
      }, 4000);
    }

    const cleanup: (() => void)[] = [];

    const toastHandler = (e: Event) => {
      const msg = (e as CustomEvent<string>).detail;
      if (msg) addToast(msg);
    };
    window.addEventListener("toast", toastHandler);
    cleanup.push(() => window.removeEventListener("toast", toastHandler));

    let es: EventSource | null = null;
    if (window.EventSource) {
      es = new EventSource("/events");
      es.addEventListener("ticketCreated", (e) =>
        addToast("Ticket created: " + (e as MessageEvent).data),
      );
      es.addEventListener("ticketUpdated", (e) =>
        addToast("Ticket updated: " + (e as MessageEvent).data),
      );
      cleanup.push(() => es && es.close());
    }
    return () => {
      cleanup.forEach((fn) => fn());
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-black text-white px-3 py-2 rounded shadow"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
