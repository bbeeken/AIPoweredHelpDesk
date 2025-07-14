import { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, registerables, type ChartConfiguration } from 'chart.js';

ChartJS.register(...registerables);

interface ForecastData { forecast: number; }

export default function ForecastWidget({ onRemove }: { onRemove: () => void }) {
  const [forecast, setForecast] = useState<number | null>(null);
  const ref = useRef<HTMLCanvasElement>(null);
  const days = 14;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/stats/forecast?days=${days}`);
        const data: ForecastData = await res.json();
        setForecast(data.forecast);
      } catch (err) {
        console.error('Failed to load forecast', err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (forecast == null || !ref.current) return;
    const labels = Array.from({ length: days }, (_, i) => `Day ${i + 1}`);
    const daily = forecast / days;
    const dataset = Array.from({ length: days }, () => daily);
    const cfg: ChartConfiguration<'line'> = {
      type: 'line',
      data: { labels, datasets: [{ data: dataset, borderColor: '#3b82f6', fill: false }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
    };
    const chart = new ChartJS(ref.current, cfg);
    return () => chart.destroy();
  }, [forecast]);

  return (
    <div className="border rounded p-2 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold">Ticket Forecast</h3>
        <button aria-label="Remove" onClick={onRemove} className="text-sm text-error dark:text-error-dark touch-target">✕</button>
      </div>
      {forecast != null ? <canvas ref={ref} /> : <p>Loading...</p>}
    </div>
  );
}
