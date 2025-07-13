import { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration } from 'chart.js';

type WidgetId = 'status' | 'forecast';

interface ForecastData { forecast: number; }
interface DashboardStats {
  tickets: { open: number; waiting: number; closed: number };
}

const AVAILABLE_WIDGETS: { id: WidgetId; label: string }[] = [
  { id: 'status', label: 'Ticket Status' },
  { id: 'forecast', label: 'Ticket Forecast' },
];

function StatusWidget({ onRemove }: { onRemove: () => void }) {
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
    if (!stats || !canvasRef.current) return;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/stats/dashboard');
        const data: DashboardStats = await res.json();
        setStats({ tickets: data.tickets });
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    }
    load();
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
    const chart = new Chart(ref.current, cfg);
    return () => chart.destroy();
  }, [stats]);

  return (
    <div className="border rounded p-2 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold">Ticket Status</h3>
        <button aria-label="Remove" onClick={onRemove} className="text-sm text-red-600">✕</button>
      </div>
      {stats ? <canvas ref={ref} /> : <p>Loading...</p>}
    </div>
  );
}

function ForecastWidget({ onRemove }: { onRemove: () => void }) {
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
    const chart = new Chart(ref.current, cfg);
    return () => chart.destroy();
  }, [forecast]);

  return (
    <div className="border rounded p-2 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold">Ticket Forecast</h3>
        <button aria-label="Remove" onClick={onRemove} className="text-sm text-red-600">✕</button>
      </div>
      {forecast != null ? <canvas ref={ref} /> : <p>Loading...</p>}
    </div>
  );
}

function Widget({ id, onRemove }: { id: WidgetId; onRemove: () => void }) {
  switch (id) {
    case 'forecast':
      return <ForecastWidget onRemove={onRemove} />;
    case 'status':
    default:
      return <StatusWidget onRemove={onRemove} />;
  }
}

export default function StatsPanel() {
  const [widgets, setWidgets] = useState<WidgetId[]>(() => {
    const saved = localStorage.getItem('dashboardWidgets');
    return saved ? (JSON.parse(saved) as WidgetId[]) : ['status'];
  });
  const [next, setNext] = useState<WidgetId>('status');

  useEffect(() => {
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
  }, [widgets]);

  const addWidget = () => {
    if (!widgets.includes(next)) setWidgets([...widgets, next]);
  };

  const removeWidget = (id: WidgetId) => {
    setWidgets(widgets.filter((w) => w !== id));
  };

  const available = AVAILABLE_WIDGETS.filter((w) => !widgets.includes(w.id));

  return (
    <section className="mb-6" aria-live="polite">
      <h2 className="text-xl font-semibold mb-2">Dashboard Widgets</h2>
      <div className="mb-4">
        {available.length > 0 && (
          <>
            <label htmlFor="widgetSelect" className="mr-2">Add Widget:</label>
            <select
              id="widgetSelect"
              value={next}
              onChange={(e) => setNext(e.target.value as WidgetId)}
              className="border px-1 py-0.5 mr-2"
            >
              {available.map((w) => (
                <option key={w.id} value={w.id}>{w.label}</option>
              ))}
            </select>
            <button onClick={addWidget} className="bg-blue-600 text-white px-2 py-0.5 rounded">
              Add
            </button>
          </>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {widgets.map((id) => (
          <Widget key={id} id={id} onRemove={() => removeWidget(id)} />
        ))}
      </div>
    </section>
  );
}
