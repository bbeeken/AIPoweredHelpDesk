import { useEffect, useState } from 'react';

export interface AnalyticsUpdate {
  priorityStats?: Record<string, number>;
  timeSeriesData?: any[];
  teamPerformance?: any[];
}

export default function useAnalyticsSocket() {
  const [update, setUpdate] = useState<AnalyticsUpdate>({});

  useEffect(() => {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/analytics`);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        setUpdate((u) => ({ ...u, ...(msg.data ?? msg) }));
      } catch (err) {
        console.error('analytics socket error', err);
      }
    };
    return () => ws.close();
  }, []);

  return update;
}
