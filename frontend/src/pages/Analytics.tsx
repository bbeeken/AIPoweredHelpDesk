import { useEffect, useRef, useState } from 'react';

import useAnalyticsSocket from '../hooks/useAnalyticsSocket';

import { Tabs } from 'antd';
import { Chart as ChartJS, registerables, MatrixController, MatrixElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import AdvancedFilters, { AnalyticsFilters } from '../components/AdvancedFilters';

ChartJS.register(...registerables, MatrixController, MatrixElement);

interface SeriesPoint {
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
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [priority, setPriority] = useState<Record<string, number>>({});
  const [forecast, setForecast] = useState<number[]>([]);
  const [heat, setHeat] = useState<HeatCell[]>([]);
  const heatRef = useRef<HTMLCanvasElement>(null);

  useAnalyticsSocket(update => {
    if (update.priorityStats) {
      setPriorityStats(prev => ({ ...prev, ...update.priorityStats }));
    }
    if (update.timeSeriesData) {
      setTimeSeriesData(update.timeSeriesData);
    }
    if (update.teamPerformance) {
      setTeamPerformance(update.teamPerformance);
    }
  });

  useEffect(() => {
    document.title = 'Analytics - AI Help Desk';

    loadAnalyticsData();
  }, [timeRange]);

  async function loadAnalyticsData() {
    setLoading(true);
    try {
      const days =
        timeRange === '1y' ? 365 : Number(timeRange.replace('d', '')) || 30;

      const [overviewRes, tsRes] = await Promise.all([
        fetch('/api/analytics/overview').then(r => r.json()),
        fetch(`/api/analytics/timeseries?days=${days}`).then(r => r.json()),
      ]);

      setPriorityStats(overviewRes.priorities || {});
      setTeamPerformance(overviewRes.teamPerformance || []);
      setTimeSeriesData(tsRes || []);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);

    loadData();
  }, [filters]);

  function loadData() {
    const days = 7;
    const today = new Date();
    const tmpSeries: SeriesPoint[] = [];
    const tmpForecast: number[] = [];
    const prio: Record<string, number> = { low: 20, medium: 40, high: 15, urgent: 5 };
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      tmpSeries.push({
        date: d.toISOString().slice(0, 10),
        created: Math.floor(Math.random() * 50) + 10,
        resolved: Math.floor(Math.random() * 50) + 5,
      });
      tmpForecast.push(Math.floor(Math.random() * 50) + 20);
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
              const value = (ctx.raw as HeatCell).v;
              return `hsl(220,60%,${95 - value * 8}%)`;
            },
            width: () => 12,
            height: () => 12,
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
        backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444', '#6366f1'],
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
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  function toggleMetric(m: string) {
    setSelectedMetrics(s => (s.includes(m) ? s.filter(x => x !== m) : [...s, m]));
  }

  function generateReport() {
    alert(`Report generated with: ${selectedMetrics.join(', ')}`);
  }

  return (
    <main id="main" className="p-4 space-y-6 font-sans">
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
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Tickets Over Time</h3>
                    <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} height={180} />
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Priority Distribution</h3>
                    <Doughnut data={donutData} />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Activity Heatmap</h3>
                  <canvas ref={heatRef} className="w-full h-64" />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Predictive Forecast</h3>
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
                <p className="text-gray-700 dark:text-gray-300">Select metrics to include:</p>
                {metrics.map(m => (
                  <label key={m} className="flex items-center gap-2">
                    <input type="checkbox" checked={selectedMetrics.includes(m)} onChange={() => toggleMetric(m)} />
                    <span>{m}</span>
                  </label>
                ))}
                <button
                  onClick={generateReport}
                  className="bg-primary dark:bg-primary-dark text-white px-4 py-2 rounded"
                >
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
