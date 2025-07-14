import { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, registerables, type ChartConfiguration } from 'chart.js';

ChartJS.register(...registerables);

interface DashboardStats {
  tickets: { open: number; waiting: number; closed: number };
}

export default function StatusWidget({ onRemove }: { onRemove: () => void }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  async function loadStats() {
    try {
      const res = await fetch('/stats/dashboard');
      const data: DashboardStats = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats', err);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (!window.EventSource) return;
    const es = new EventSource('/events');
    es.addEventListener('ticketCreated', loadStats);
    es.addEventListener('ticketUpdated', loadStats);
    return () => es.close();
  }, []);

  useEffect(() => {
    if (!stats || !ref.current) return;
    const cfg: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: ['Open', 'Waiting', 'Closed'],
        datasets: [
          {
            data: [stats.tickets.open, stats.tickets.waiting, stats.tickets.closed],
            backgroundColor: ['#3b82f6', '#facc15', '#10b981'],
          },
        ],
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
    };
    const chart = new ChartJS(ref.current, cfg);
    return () => chart.destroy();
  }, [stats]);

  return (
    <div className="border rounded p-2 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold">Ticket Status</h3>
        <button aria-label="Remove" onClick={onRemove} className="text-sm text-error dark:text-error-dark touch-target">✕</button>
      </div>
      {stats ? <canvas ref={ref} /> : <p>Loading...</p>}
    </div>
  );
}
