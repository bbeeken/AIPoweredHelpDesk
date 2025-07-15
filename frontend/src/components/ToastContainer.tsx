
import { useEffect, useState } from "react";
import useRealtime from "../hooks/useRealtime";

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

  function addToast(message: string) {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 4000);
  }

  useRealtime("ticketCreated", (data: any) => addToast("Ticket created: " + data));
  useRealtime("ticketUpdated", (data: any) => addToast("Ticket updated: " + data));

  useEffect(() => {
    const cleanup: (() => void)[] = [];


import { useEffect } from 'react';
import { message } from 'antd';

export default function ToastContainer() {
  useEffect(() => {
    function addToast(msg: string) {
      message.info(msg, 4);
    }


    const toastHandler = (e: Event) => {
      const msg = (e as CustomEvent<string>).detail;
      if (msg) addToast(msg);
    };
    window.addEventListener('toast', toastHandler);


    let es: EventSource | null = null;
    if (window.EventSource) {
      es = new EventSource('/events');
      es.addEventListener('ticketCreated', e =>
        addToast('Ticket created: ' + (e as MessageEvent).data)
      );
      es.addEventListener('ticketUpdated', e =>
        addToast('Ticket updated: ' + (e as MessageEvent).data)
      );
    }

    return () => {
      window.removeEventListener('toast', toastHandler);
      es && es.close();
    };
  }, []);

  return null;
}
