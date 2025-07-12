import { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration } from 'chart.js';

interface PriorityStats {
  [key: string]: number;
}

export default function Analytics() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<PriorityStats | null>(null);

  useEffect(() => {
    document.title = 'Analytics - AI Help Desk';
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/stats/priorities');
        const data: PriorityStats = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!stats || !canvasRef.current) return;
    const labels = Object.keys(stats);
    const values = Object.values(stats);
    const cfg: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: ['#3b82f6', '#facc15', '#10b981', '#f87171'] }],
      },
      options: { plugins: { legend: { position: 'bottom' } } },
    };
    const chart = new Chart(canvasRef.current, cfg);
    return () => chart.destroy();
  }, [stats]);

  return (
    <main className="p-4" id="main">
      <h2 className="text-xl font-semibold mb-2">Ticket Priorities</h2>
      <canvas ref={canvasRef} />
    </main>
  );
}
