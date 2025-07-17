import { useEffect, useRef, useState } from "react";
import useAnalyticsSocket from "../hooks/useAnalyticsSocket";
import { Tabs } from "antd";
import {
  Chart as ChartJS,
  registerables,
  MatrixController,
  MatrixElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import AdvancedFilters, {
  AnalyticsFilters,
} from "../components/AdvancedFilters";

ChartJS.register(...registerables, MatrixController, MatrixElement);

interface SeriesPoint {
  date: string;
  tickets: number;
  resolved: number;
}

interface HeatCell {
  x: number;
  y: number;
  v: number;
}

export default function Analytics() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [timeRange, setTimeRange] = useState("30d");
  const [timeSeriesData, setTimeSeriesData] = useState<SeriesPoint[]>([]);
  const [priorityStats, setPriorityStats] = useState<Record<string, number>>(
    {},
  );
  const [forecast, setForecast] = useState<number>(0);
  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
  const [heat, setHeat] = useState<HeatCell[]>([]);
  const heatRef = useRef<HTMLCanvasElement>(null);

  useAnalyticsSocket((update) => {
    if (update.priorityStats) {
      setPriorityStats((prev) => ({ ...prev, ...update.priorityStats }));
    }
    if (update.timeSeriesData) {
      setTimeSeriesData(update.timeSeriesData);
    }
    if (update.teamPerformance) {
      setTeamPerformance(update.teamPerformance);
    }
  });

  useEffect(() => {
    document.title = "Analytics - AI Help Desk";
    loadAnalyticsData();
  }, [timeRange]);

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  async function loadAnalyticsData() {
    try {
      const days =
        timeRange === "1y" ? 365 : Number(timeRange.replace("d", "")) || 30;
      const [overviewRes, tsRes] = await Promise.all([
        fetch("/api/analytics/overview").then((r) => r.json()),
        fetch(`/api/analytics/timeseries?days=${days}`).then((r) => r.json()),
      ]);
      setPriorityStats(overviewRes.priorities || {});
      setTeamPerformance(overviewRes.teamPerformance || []);
      setTimeSeriesData(tsRes || []);
      setForecast(overviewRes.forecast || 0);
      generateHeat();
    } catch (err) {
      console.error("Failed to load analytics", err);
    }
  }

  function generateHeat() {
    const cells: HeatCell[] = [];
    for (let dow = 0; dow < 7; dow++) {
      for (let hour = 0; hour < 24; hour++) {
        cells.push({ x: dow, y: hour, v: Math.floor(Math.random() * 10) });
      }
    }
    setHeat(cells);
  }

  async function handleExport(format: string = "csv") {
    const res = await fetch("/api/analytics/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format }),
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics.${format === "excel" ? "xlsx" : format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  useEffect(() => {
    if (!heatRef.current) return;
    const chart = new ChartJS(heatRef.current, {
      type: "matrix",
      data: {
        datasets: [
          {
            label: "Activity",
            data: heat,
            backgroundColor: (ctx) => {
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
            type: "category",
            labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            grid: { display: false },
          },
          y: {
            type: "category",
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
    labels: timeSeriesData.map((s) => s.date),
    datasets: [
      {
        label: "Created",
        data: timeSeriesData.map((s) => s.tickets),
        borderColor: "#1F73B7",
        backgroundColor: "rgba(31,115,183,0.1)",
        fill: true,
      },
      {
        label: "Resolved",
        data: timeSeriesData.map((s) => s.resolved),
        borderColor: "#16A34A",
        backgroundColor: "rgba(22,163,74,0.1)",
        fill: true,
      },
    ],
  };

  const donutData = {
    labels: Object.keys(priorityStats),
    datasets: [
      {
        data: Object.values(priorityStats),
        backgroundColor: ["#3b82f6", "#f59e0b", "#ef4444", "#6366f1"],
      },
    ],
  };

  const forecastData = {
    labels: Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "Forecast",
        data: Array(7).fill(forecast),
        borderColor: "#8b5cf6",
        fill: false,
      },
    ],
  };

  const metrics = [
    "Resolution rate",
    "Avg response time",
    "Satisfaction",
    "Forecast",
  ];
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  function toggleMetric(m: string) {
    setSelectedMetrics((s) =>
      s.includes(m) ? s.filter((x) => x !== m) : [...s, m],
    );
  }

  function generateReport() {
    alert(`Report generated with: ${selectedMetrics.join(", ")}`);
  }

  const totalTickets = Object.values(priorityStats).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <main id="main" className="p-4 space-y-6 font-sans">
      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            label: "Overview",
            key: "overview",
            children: (
              <div className="space-y-6">
                <AdvancedFilters filters={filters} onChange={setFilters} />
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                      Tickets Over Time
                    </h3>
                    <Line
                      data={lineData}
                      options={{ responsive: true, maintainAspectRatio: false }}
                      height={180}
                    />
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                      Priority Distribution
                    </h3>
                    <Doughnut data={donutData} />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    Activity Heatmap
                  </h3>
                  <canvas ref={heatRef} className="w-full h-64" />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    Predictive Forecast
                  </h3>
                  <Line
                    data={forecastData}
                    options={{ responsive: true, maintainAspectRatio: false }}
                    height={180}
                  />
                </div>
              </div>
            ),
          },
          {
            label: "Custom Reports",
            key: "reports",
            children: (
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Select metrics to include:
                </p>
                {metrics.map((m) => (
                  <label key={m} className="flex items-center gap-2">
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
