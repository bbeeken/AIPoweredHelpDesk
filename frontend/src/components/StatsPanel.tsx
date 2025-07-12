import { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration } from 'chart.js';

interface DashboardStats {
  tickets: { open: number; waiting: number; closed: number };
  forecast: number;
  mttr: number;
  assets: { total: number };
}

export default function StatsPanel() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/stats/dashboard');
        const data: DashboardStats = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Error loading stats', err);
      }
    }
    loadStats();
  }, []);

  useEffect(() => {
    if (!stats || !canvasRef.current) return;
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
    const chart = new Chart(canvasRef.current, cfg);
    return () => chart.destroy();
  }, [stats]);

  if (!stats) return <p>Loading stats...</p>;

  return (
    <section className="mb-6" aria-live="polite">
      <h2 className="text-xl font-semibold mb-2">Ticket Stats</h2>
      <canvas ref={canvasRef} className="mb-4" />
      <p>Open: {stats.tickets.open}, Waiting: {stats.tickets.waiting}, Closed: {stats.tickets.closed}</p>
      <p>Expected new tickets next 7 days: {stats.forecast.toFixed(1)}</p>
      <p>Average resolution time: {stats.mttr.toFixed(1)}h</p>
      <p>Total assets: {stats.assets.total}</p>
    </section>
  );
}
