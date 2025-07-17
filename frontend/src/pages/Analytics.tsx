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
  const [priorityStats, setPriorityStats] = useState<Record<string, number>>({});
  const [timeSeriesData, setTimeSeriesData] = useState<SeriesPoint[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
  const [priority, setPriority] = useState<Record<string, number>>({});
  const [forecast, setForecast] = useState<number[]>([]);
  const [heat, setHeat] = useState<HeatCell[]>([]);
  const heatRef = useRef<HTMLCanvasElement>(null);

  const updates = useAnalyticsSocket();

  useEffect(() => {
    if (updates.priorityStats) {
      setPriorityStats(prev => ({ ...prev, ...updates.priorityStats! }));
    }
    if (updates.timeSeriesData) {
      setTimeSeriesData(updates.timeSeriesData);
    }
    if (updates.teamPerformance) {
      setTeamPerformance(updates.teamPerformance);
    }
  }, [updates]);

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


  async function handleExport(format: string = 'csv') {
    const res = await fetch('/api/analytics/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format })
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics.${format === 'excel' ? 'xlsx' : format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  const totalTickets = Object.values(priorityStats).reduce((sum, count) => sum + count, 0);
  const maxValue = Math.max(...timeSeriesData.map(d => Math.max(d.tickets, d.resolved)));

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

    <main ref={mainRef} className="p-6 space-y-6" id="main">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Insights and performance metrics for your help desk
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <label htmlFor="timeRange" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Time Range:
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolution Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">94.2%</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +2.1% from last month
                </span>
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Response Time</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">2.4h</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  -0.3h from last month
                </span>
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer Satisfaction</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">4.8/5.0</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  +0.2 from last month
                </span>
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ticket Priority Distribution</h3>
          <div className="space-y-4">
            {Object.entries(priorityStats).map(([priority, count]) => {
              const percentage = totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0;
              const colors = {
                low: 'bg-gray-500',
                medium: 'bg-yellow-500',
                high: 'bg-orange-500',
                urgent: 'bg-red-500'
              };
              
              return (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="flex items-center w-20">
                      <div className={`w-3 h-3 rounded-full ${colors[priority as keyof typeof colors]} mr-2`}></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {priority}
                      </span>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${colors[priority as keyof typeof colors]}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>

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
