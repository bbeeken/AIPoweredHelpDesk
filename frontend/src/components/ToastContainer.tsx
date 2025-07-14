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
