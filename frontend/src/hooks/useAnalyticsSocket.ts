import { useEffect, useRef } from 'react';

export default function useAnalyticsSocket(handler: (data: any) => void) {
  const cb = useRef(handler);
  cb.current = handler;

  useEffect(() => {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/analytics`);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        cb.current(msg.data ?? msg);
      } catch (err) {
        console.error('analytics socket error', err);
      }
    };
    return () => ws.close();
  }, []);
}
