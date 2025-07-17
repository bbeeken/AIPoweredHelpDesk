/* pages/Analytics.tsx ------------------------------------------------------ */
import { useEffect, useRef, useState } from 'react';
import { Tabs, Select, message } from 'antd';
import { Chart as ChartJS, registerables, MatrixController, MatrixElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import AdvancedFilters, { AnalyticsFilters } from '../components/AdvancedFilters';
import useAnalyticsSocket from '../hooks/useAnalyticsSocket';

ChartJS.register(...registerables, MatrixController, MatrixElement);

/* ------------------------------------------------------------------------- */
/* Type Definitions                                                          */
/* ------------------------------------------------------------------------- */
interface TimeSeriesPoint {
  date: string;   // ISO‑8601 (yyyy‑MM‑dd)
  tickets: number;
  resolved: number;
}

interface HeatCell {
  /* dow = 0 Sun … 6 Sat, hour = 0 … 23 */
  x: number;
  y: number;
  v: number;      // intensity 0‑10
}

interface TeamPerformance {
  name: string;
  resolved: number;
  avgTime: string;
  satisfaction: number;
}

/* ------------------------------------------------------------------------- */
/* Analytics Page                                                            */
/* ------------------------------------------------------------------------- */
export default function Analytics() {
  /* ---------------------------- State ------------------------------------ */
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const [timeSeriesData, setSeries]            = useState<TimeSeriesPoint[]>([]);
  const [priorityStats,  setPriority]          = useState<Record<string, number>>({});
  const [forecast,       setForecast]          = useState<number[]>([]);
  const [teamPerformance,setTeamPerformance]   = useState<TeamPerformance[]>([]);
  const [heat,           setHeat]              = useState<HeatCell[]>([]);
  const [selectedMetrics,setSelectedMetrics]   = useState<string[]>([]);

  const heatRef = useRef<HTMLCanvasElement>(null);

  /* ----------------------- Live Socket Updates --------------------------- */
  useAnalyticsSocket(update => {
    if (update.priorityStats)  setPriority(prev => ({ ...prev, ...update.priorityStats }));
    if (update.timeSeriesData) setSeries(update.timeSeriesData);
    if (update.teamPerformance)setTeamPerformance(update.teamPerformance);
    if (update.forecast)       setForecast(update.forecast);
  });

  /* ------------------------ Initial / Filter Load ------------------------ */
  useEffect(() => {
    document.title = 'Analytics ‑ AI Help Desk';
    void loadAnalyticsData();
    // eslint‑disable‑next‑line react‑hooks/exhaustive‑deps
  }, [timeRange, filters]);

  async function loadAnalyticsData() {
    try {
      const days =
        timeRange === '1y' ? 365 :
        timeRange === '90d' ? 90  :
        timeRange === '30d' ? 30  : 7;

      const [overviewRes, tsRes] = await Promise.all([
        fetch('/api/analytics/overview', {
          method: 'POST',
          headers: { 'Content‑Type': 'application/json' },
          body: JSON.stringify({ filters }),
        }).then(r => r.json()),
        fetch(`/api/analytics/timeseries?days=${days}`, {
          method: 'POST',
          headers: { 'Content‑Type': 'application/json' },
          body: JSON.stringify({ filters }),
        }).then(r => r.json()),
      ]);

      setPriority(overviewRes.priorities ?? {});
      setTeamPerformance(overviewRes.teamPerformance ?? []);
      setForecast(overviewRes.forecast ?? []);
      setSeries(tsRes ?? []);
      generateHeat();
    } catch (err) {
      console.error('Failed to load analytics', err);
      message.error('Unable to load analytics data.');
    }
  }

  /* ------------------------- Heat‑Map Helper ----------------------------- */
  function generateHeat() {
    const cells: HeatCell[] = [];
    for (let dow = 0; dow < 7; dow++) {
      for (let hour = 0; hour < 24; hour++) {
        cells.push({
          x: dow,
          y: hour,
          v: Math.floor(Math.random() * 10),       // demo only; replace with real data
        });
      }
    }
    setHeat(cells);
  }

  /* -------------------------- Data Export -------------------------------- */
  async function handleExport(format: 'csv' | 'excel' = 'csv') {
    try {
      const res = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: { 'Content‑Type': 'application/json' },
        body: JSON.stringify({ format, filters }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `analytics.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      message.error('Export failed');
    }
  }

  /* -------------------------- Heat‑Map Chart ----------------------------- */
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
            width:  () => 14,
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

  /* ---------------------- Chart.js Datasets ------------------------------ */
  const lineData = {
    labels: timeSeriesData.map(s => s.date),
    datasets: [
      {
        label: 'Created',
        data:  timeSeriesData.map(s => s.tickets),
        borderColor: '#1F73B7',
        backgroundColor: 'rgba(31,115,183,0.1)',
        fill: true,
      },
      {
        label: 'Resolved',
        data:  timeSeriesData.map(s => s.resolved),
        borderColor: '#16A34A',
        backgroundColor: 'rgba(22,163,74,0.1)',
        fill: true,
      },
    ],
  };

  const donutData = {
    labels: Object.keys(priorityStats),
    datasets: [
      {
        data: Object.values(priorityStats),
        backgroundColor: ['#1F73B7', '#D97706', '#DC2626', '#6366f1'],
      },
    ],
  };

  const forecastData = {
    labels: Array.from({ length: forecast.length }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: 'Forecast',
        data: forecast,
        borderColor: '#8b5cf6',
        fill: false,
      },
    ],
  };

  /* ------------------ Custom Report Builder ------------------------------ */
  const metrics = ['Resolution rate', 'Avg response time', 'Satisfaction', 'Forecast'];
  const toggleMetric = (m: string) =>
    setSelectedMetrics(prev => (prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]));

  const generateReport = () =>
    message.success(`Report generated with: ${selectedMetrics.join(', ') || 'no metrics selected'}`);

  /* ------------------------------- JSX ----------------------------------- */
  return (
    <main id="main" className="p‑6 space‑y‑6 font‑sans">
      <div className="flex items‑center gap‑4">
        <Select
          value={timeRange}
          onChange={v => setTimeRange(v)}
          options={[
            { label: '7 Days',  value: '7d'  },
            { label: '30 Days', value: '30d' },
            { label: '90 Days', value: '90d' },
            { label: '1 Year',  value: '1y'  },
          ]}
          style={{ width: 120 }}
        />
        <button
          onClick={() => handleExport('csv')}
          className="bg‑primary text‑white px‑3 py‑1 rounded"
        >
          Export CSV
        </button>
        <button
          onClick={() => handleExport('excel')}
          className="bg‑primary text‑white px‑3 py‑1 rounded"
        >
          Export Excel
        </button>
      </div>

      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: 'overview',
            label: 'Overview',
            children: (
              <div className="space‑y‑6">
                <AdvancedFilters filters={filters} onChange={setFilters} />

                <div className="grid gap‑6 md:grid‑cols‑2">
                  <div className="bg‑white dark:bg‑neutral‑800 p‑4 rounded‑xl shadow">
                    <h3 className="text‑lg font‑semibold mb‑2 text‑neutral‑900 dark:text‑white">
                      Tickets Over Time
                    </h3>
                    <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} height={180} />
                  </div>

                  <div className="bg‑white dark:bg‑neutral‑800 p‑4 rounded‑xl shadow">
                    <h3 className="text‑lg font‑semibold mb‑2 text‑neutral‑900 dark:text‑white">
                      Priority Distribution
                    </h3>
                    <Doughnut data={donutData} />
                  </div>
                </div>

                <div className="bg‑white dark:bg‑neutral‑800 p‑4 rounded‑xl shadow">
                  <h3 className="text‑lg font‑semibold mb‑2 text‑neutral‑900 dark:text‑white">
                    Activity Heat‑Map
                  </h3>
                  <canvas ref={heatRef} className="w‑full h‑64" />
                </div>

                <div className="bg‑white dark:bg‑neutral‑800 p‑4 rounded‑xl shadow">
                  <h3 className="text‑lg font‑semibold mb‑2 text‑neutral‑900 dark:text‑white">
                    Predictive Forecast
                  </h3>
                  <Line data={forecastData} options={{ responsive: true, maintainAspectRatio: false }} height={180} />
                </div>
              </div>
            ),
          },
          {
            key: 'reports',
            label: 'Custom Reports',
            children: (
              <div className="space‑y‑4">
                <p className="text‑neutral‑700 dark:text‑neutral‑300">Select metrics to include:</p>
                {metrics.map(m => (
                  <label key={m} className="flex items‑center gap‑2">
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(m)}
                      onChange={() => toggleMetric(m)}
                    />
                    <span>{m}</span>
                  </label>
                ))}
                <button
                  onClick={generateReport}
                  className="bg‑primary dark:bg‑primary‑dark text‑white px‑4 py‑2 rounded"
                >
                  Generate Report
                </button>
              </div>
            ),
          },
        ]}
      />
    </main>
  );
}
/* ------------------------------------------------------------------------- */
