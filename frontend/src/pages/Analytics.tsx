import { useEffect, useRef, useState } from 'react';
import { Tabs } from 'antd';
import { Chart as ChartJS, registerables, MatrixController, MatrixElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import AdvancedFilters, { AnalyticsFilters } from '../components/AdvancedFilters';

ChartJS.register(...registerables, MatrixController, MatrixElement);

interface TimeSeriesPoint {
  date: string;
  created: number;
  resolved: number;
}

interface HeatCell {
  x: number;
  y: number;
  v: number;
}

export default function Analytics() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [series, setSeries] = useState<TimeSeriesPoint[]>([]);
  const [priority, setPriority] = useState<Record<string, number>>({});
  const [forecast, setForecast] = useState<number[]>([]);
  const [heat, setHeat] = useState<HeatCell[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const heatRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.title = 'Analytics - AI Help Desk';
    loadData();
  }, [filters]);

  function loadData() {
    const days = 7;
    const tmpSeries: TimeSeriesPoint[] = [];
    const tmpForecast: number[] = [];
    const prio: Record<string, number> = { low: 12, medium: 38, high: 22, urgent: 8 };
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      tmpSeries.push({
        date: d.toISOString().slice(0, 10),
        created: Math.floor(Math.random() * 40) + 10,
        resolved: Math.floor(Math.random() * 40) + 5,
      });
      tmpForecast.push(Math.floor(Math.random() * 40) + 20);
    }

    const cells: HeatCell[] = [];
    for (let dow = 0; dow < 7; dow++) {
      for (let hour = 0; hour < 24; hour++) {
        cells.push({ x: dow, y: hour, v: Math.floor(Math.random() * 10) });
      }
    }

    setSeries(tmpSeries);
    setForecast(tmpForecast);
    setPriority(prio);
    setHeat(cells);
  }

  useEffect(() => {
    if (!heatRef.current) return;
    const chart = new ChartJS(heatRef.current, {
      type: 'matrix',
      data: {
        datasets: [
          {
            label: 'Activity',
            data: heat,
            backgroundColor: ctx => {
              const val = (ctx.raw as HeatCell).v;
              return `hsl(219, 60%, ${95 - val * 8}%)`;
            },
            width: () => 14,
            height: () => 14,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: {
            type: 'category',
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            grid: { display: false },
          },
          y: {
            type: 'category',
            labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
            grid: { display: false },
            reverse: true,
          },
        },
      },
    });
    return () => chart.destroy();
  }, [heat]);

  const lineData = {
    labels: series.map(s => s.date),
    datasets: [
      {
        label: 'Created',
        data: series.map(s => s.created),
        borderColor: '#1F73B7',
        backgroundColor: 'rgba(31,115,183,0.1)',
        fill: true,
      },
      {
        label: 'Resolved',
        data: series.map(s => s.resolved),
        borderColor: '#16A34A',
        backgroundColor: 'rgba(22,163,74,0.1)',
        fill: true,
      },
    ],
  };

  const donutData = {
    labels: Object.keys(priority),
    datasets: [
      {
        data: Object.values(priority),
        backgroundColor: ['#1F73B7', '#D97706', '#DC2626', '#6366f1'],
      },
    ],
  };

  const forecastData = {
    labels: series.map((_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: 'Forecast',
        data: forecast,
        borderColor: '#8b5cf6',
        fill: false,
      },
    ],
  };

  const metrics = ['Resolution rate', 'Avg response time', 'Satisfaction', 'Forecast'];

  function toggleMetric(m: string) {
    setSelectedMetrics(s => (s.includes(m) ? s.filter(x => x !== m) : [...s, m]));
  }

  function generateReport() {
    alert(`Report generated with: ${selectedMetrics.join(', ')}`);
  }

  return (
    <main id="main" className="p-6 space-y-6 font-sans">
      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            label: 'Overview',
            key: 'overview',
            children: (
              <div className="space-y-6">
                <AdvancedFilters filters={filters} onChange={setFilters} />
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow">
                    <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white">Tickets Over Time</h3>
                    <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} height={180} />
                  </div>
                  <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow">
                    <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white">Priority Distribution</h3>
                    <Doughnut data={donutData} />
                  </div>
                </div>
                <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow">
                  <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white">Activity Heatmap</h3>
                  <canvas ref={heatRef} className="w-full h-64" />
                </div>
                <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl shadow">
                  <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white">Predictive Forecast</h3>
                  <Line data={forecastData} options={{ responsive: true, maintainAspectRatio: false }} height={180} />
                </div>
              </div>
            ),
          },
          {
            label: 'Custom Reports',
            key: 'reports',
            children: (
              <div className="space-y-4">
                <p className="text-neutral-700 dark:text-neutral-300">Select metrics to include:</p>
                {metrics.map(m => (
                  <label key={m} className="flex items-center gap-2">
                    <input type="checkbox" checked={selectedMetrics.includes(m)} onChange={() => toggleMetric(m)} />
                    <span>{m}</span>
                  </label>
                ))}
                <button onClick={generateReport} className="bg-primary dark:bg-primary-dark text-white px-4 py-2 rounded">
                  Generate Report
                </button>
              </div>
            ),
          },
        ]}
      />
    </main>
  );
}
