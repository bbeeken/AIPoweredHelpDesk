import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import TicketTable from '../TicketTable';
import useRealtime from '../hooks/useRealtime';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale);

const colors = {
  primary: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
  success: { 50: '#f0fdf4', 500: '#22c55e', 600: '#16a34a' },
  warning: { 50: '#fffbeb', 500: '#f59e0b', 600: '#d97706' },
  danger: { 50: '#fef2f2', 500: '#ef4444', 600: '#dc2626' },
  gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 800: '#1f2937', 900: '#111827' },
};

const statusColors = {
  open: 'bg-red-100 text-red-800 border-red-200',
  'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  waiting: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200',
};

const priorityColors = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-green-500 text-white',
};

interface DashboardStats {
  active: number;
  resolvedToday: number;
  avgResponse: number;
  satisfaction: number;
  sla: number;
  utilization: number;
  trend: { [k: string]: number };
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignee?: { id: number; name: string; avatar: string };
  requester: { id: number; name: string; email: string; avatar: string };
  category: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags: string[];
  slaStatus: 'met' | 'at-risk' | 'breached';
}

interface Activity {
  id: string;
  type: 'ticket_created' | 'ticket_updated' | 'ticket_assigned' | 'comment_added';
  user: { name: string; avatar: string };
  ticket?: { id: number; title: string };
  message: string;
  timestamp: string;
}

interface FilterState {
  status: string[];
  priority: string[];
  assignee: string[];
  category: string[];
  dateRange: { start: Date; end: Date };
  tags: string[];
  slaStatus: string[];
  searchQuery: string;
}

interface Widget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'activity' | 'custom';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: Record<string, any>;
}

interface DashboardStore {
  selectedTickets: number[];
  filters: FilterState;
  viewMode: 'table' | 'kanban' | 'list';
  widgets: Widget[];
  setSelectedTickets: (ids: number[]) => void;
  updateFilters: (filters: Partial<FilterState>) => void;
  toggleViewMode: () => void;
  updateWidgets: (widgets: Widget[]) => void;
}

const useDashboardStore = create<DashboardStore>(set => ({
  selectedTickets: [],
  filters: {
    status: [],
    priority: [],
    assignee: [],
    category: [],
    dateRange: { start: new Date(), end: new Date() },
    tags: [],
    slaStatus: [],
    searchQuery: '',
  },
  viewMode: 'table',
  widgets: [],
  setSelectedTickets: ids => set({ selectedTickets: ids }),
  updateFilters: filters => set(state => ({ filters: { ...state.filters, ...filters } })),
  toggleViewMode: () => set(state => ({ viewMode: state.viewMode === 'table' ? 'kanban' : 'table' })),
  updateWidgets: widgets => set({ widgets }),
}));

function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      return (await res.json()) as DashboardStats;
    },
    refetchInterval: 15000,
  });
}

function useTickets(filters: FilterState) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      const res = await fetch('/api/tickets');
      return (await res.json()) as Ticket[];
    },
    refetchInterval: 30000,
  });
}

function useActivity() {
  return useQuery({
    queryKey: ['activity'],
    queryFn: async () => {
      const res = await fetch('/api/activity');
      return (await res.json()) as Activity[];
    },
  });
}

function KPICard({ title, value, color, trend }: { title: string; value: number | string; color: string; trend: number }) {
  return (
    <div className={`rounded-xl p-4 shadow-sm border ${color}`} role="status">
      <div className="text-sm font-medium mb-1">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs mt-1">{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</div>
    </div>
  );
}

function KPICardsGrid() {
  const { data } = useDashboardStats();
  if (!data) return <div className="grid md:grid-cols-3 gap-4">Loading...</div>;
  const cards = [
    { title: 'Active Tickets', value: data.active, trend: data.trend.active, color: 'bg-red-50' },
    { title: 'Resolved Today', value: data.resolvedToday, trend: data.trend.resolvedToday, color: 'bg-green-50' },
    { title: 'Avg. Response Time', value: `${data.avgResponse}h`, trend: data.trend.avgResponse, color: 'bg-blue-50' },
    { title: 'Customer Satisfaction', value: `${data.satisfaction}%`, trend: data.trend.satisfaction, color: 'bg-yellow-50' },
    { title: 'SLA Compliance', value: `${data.sla}%`, trend: data.trend.sla, color: 'bg-purple-50' },
    { title: 'Team Utilization', value: `${data.utilization}%`, trend: data.trend.utilization, color: 'bg-indigo-50' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map(c => (
        <KPICard key={c.title} title={c.title} value={c.value} trend={c.trend} color={c.color} />
      ))}
    </div>
  );
}

function PerformanceCharts() {
  const { data } = useDashboardStats();
  if (!data) return null;
  const chartData = {
    labels: ['SLA', 'Utilization', 'Satisfaction'],
    datasets: [
      {
        label: 'Metrics',
        data: [data.sla, data.utilization, data.satisfaction],
        backgroundColor: [colors.primary[500], colors.success[500], colors.warning[500]],
      },
    ],
  };
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <Doughnut data={chartData} />
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <Bar data={chartData} />
      </div>
    </div>
  );
}

function TeamActivityFeed() {
  const { data, refetch } = useActivity();
  useRealtime('activity', () => refetch());
  if (!data) return <p>Loading...</p>;
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow h-64 overflow-auto">
      <h3 className="font-semibold mb-2">Team Activity</h3>
      <ul className="space-y-2 text-sm">
        {data.map(a => (
          <li key={a.id} className="border-b pb-1">
            <span className="font-medium">{a.user.name}</span> {a.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuickActionsPanel() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-2">
      <h3 className="font-semibold mb-2">Quick Actions</h3>
      <button className="w-full bg-blue-600 text-white rounded p-2">New Ticket</button>
      <button className="w-full bg-green-600 text-white rounded p-2">Bulk Assign</button>
      <button className="w-full bg-purple-600 text-white rounded p-2">Generate Report</button>
    </div>
  );
}

function FloatingActionButton() {
  return (
    <button
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center"
      aria-label="Create Ticket"
    >
      +
    </button>
  );
}

function NotificationToasts() {
  return <div id="toasts" className="fixed bottom-0 right-0 p-4 space-y-2" />;
}

export default function Dashboard() {
  const { data: ticketData } = useTickets(useDashboardStore.getState().filters);
  const setTickets = useDashboardStore(state => state.setSelectedTickets);
  useEffect(() => {
    document.title = 'Dashboard - AI Help Desk';
  }, []);

  useRealtime('ticketCreated', () => {
    // refetch tickets if needed
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50" id="main">
      <div className="container mx-auto px-6 py-8">
        <KPICardsGrid />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          <div className="lg:col-span-3 space-y-6">
            {ticketData && <TicketTable filters={{}} tickets={ticketData as any} />}
            <PerformanceCharts />
          </div>
          <div className="space-y-6">
            <TeamActivityFeed />
            <QuickActionsPanel />
          </div>
        </div>
      </div>
      <FloatingActionButton />
      <NotificationToasts />
    </div>
  );
}
