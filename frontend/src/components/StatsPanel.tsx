
import { useEffect, useState, lazy, Suspense } from 'react';
import { Select } from 'antd';

import { useEffect, useRef, useState } from 'react';

import useRealtime from '../hooks/useRealtime';

import { io } from 'socket.io-client';

import {
  Chart as ChartJS,
  registerables,
  type ChartConfiguration,
} from 'chart.js';
import { Select, Button } from 'antd';

const StatusWidget = lazy(() => import('./widgets/StatusWidget'));
const ForecastWidget = lazy(() => import('./widgets/ForecastWidget'));

type WidgetId = 'status' | 'forecast';

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


  useRealtime('ticketCreated', loadStats);
  useRealtime('ticketUpdated', loadStats);

  useEffect(() => {
    const socket = io();
    socket.on('ticketCreated', loadStats);
    socket.on('ticketUpdated', loadStats);
    return () => socket.disconnect();
  }, []);


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
    const chart = new ChartJS(ref.current, cfg);
    return () => chart.destroy();
  }, [stats]);

  return (
    <div className="border rounded p-2 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold">Ticket Status</h3>

        <Button type="text" danger size="small" onClick={onRemove} aria-label="Remove">✕</Button>

        <button aria-label="Remove" onClick={onRemove} className="text-sm text-error dark:text-error-dark">✕</button>

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
    const chart = new ChartJS(ref.current, cfg);
    return () => chart.destroy();
  }, [forecast]);

  return (
    <div className="border rounded p-2 bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold">Ticket Forecast</h3>

        <button aria-label="Remove" onClick={onRemove} className="text-sm text-error dark:text-error-dark">✕</button>

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
    setWidgets(widgets.filter(w => w !== id));
  };

  const available = AVAILABLE_WIDGETS.filter(w => !widgets.includes(w.id));

  return (
    <section className="mb-6" aria-live="polite">
      <h2 className="text-xl font-semibold mb-2">Dashboard Widgets</h2>
      <div className="mb-4">
        {available.length > 0 && (
          <>
            <label htmlFor="widgetSelect" className="mr-2">Add Widget:</label>
            <Select
              id="widgetSelect"
              value={next}
              onChange={value => setNext(value as WidgetId)}
              style={{ width: 160 }}
            >
              {available.map(w => (
                <Select.Option key={w.id} value={w.id}>{w.label}</Select.Option>
              ))}
            </Select>
            <button onClick={addWidget} className="bg-primary dark:bg-primary-dark text-white px-2 py-0.5 rounded touch-target">
              Add
            </button>

          </>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {widgets.map(id => (
          <Suspense key={id} fallback={<p>Loading...</p>}>
            <Widget id={id} onRemove={() => removeWidget(id)} />
          </Suspense>
        ))}
      </div>
    </section>
  );
}
