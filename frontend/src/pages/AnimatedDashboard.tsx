import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowTrendingUpIcon as TrendingUpIcon,
  ClockIcon,
  TicketIcon,
  UserGroupIcon,
  ChartBarIcon,
  FireIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  customer: string;
  created: string;
  updated: string;
  category: string;
}

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedToday: number;
  avgResponseTime: string;
  ticketTrend: number;
  resolutionRate: number;
}

// Mock data for demonstration
const mockTickets: Ticket[] = [
  {
    id: 1001,
    title: 'Login issues with customer portal',
    description:
      'Customer unable to access their account dashboard after password reset',
    status: 'open',
    priority: 'high',
    assignee: 'Sarah Chen',
    customer: 'TechCorp Ltd',
    created: '2024-01-15T10:30:00Z',
    updated: '2024-01-15T14:22:00Z',
    category: 'Authentication'
  },
  {
    id: 1002,
    title: 'Performance degradation on payment processing',
    description:
      'Payment gateway experiencing slow response times during peak hours',
    status: 'in-progress',
    priority: 'urgent',
    assignee: 'Mike Rodriguez',
    customer: 'E-commerce Solutions',
    created: '2024-01-15T09:15:00Z',
    updated: '2024-01-15T15:45:00Z',
    category: 'Performance'
  },
  {
    id: 1003,
    title: 'Email notifications not working',
    description:
      'Users not receiving automated email notifications for order confirmations',
    status: 'resolved',
    priority: 'medium',
    assignee: 'Lisa Wang',
    customer: 'RetailPro Inc',
    created: '2024-01-14T16:20:00Z',
    updated: '2024-01-15T11:10:00Z',
    category: 'Email'
  },
  {
    id: 1004,
    title: 'API rate limiting errors',
    description:
      'Third-party integration hitting rate limits causing service disruptions',
    status: 'open',
    priority: 'medium',
    assignee: 'David Kim',
    customer: 'DataFlow Systems',
    created: '2024-01-15T08:45:00Z',
    updated: '2024-01-15T13:30:00Z',
    category: 'API'
  },
  {
    id: 1005,
    title: 'Mobile app crashes on iOS',
    description: 'App crashes when trying to upload images on iOS 17.2',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Emma Thompson',
    customer: 'MobileFirst Corp',
    created: '2024-01-15T12:00:00Z',
    updated: '2024-01-15T16:15:00Z',
    category: 'Mobile'
  }
];

const mockStats: DashboardStats = {
  totalTickets: 847,
  openTickets: 23,
  resolvedToday: 15,
  avgResponseTime: '2.4h',
  ticketTrend: 12,
  resolutionRate: 94.2
};

const statusColors = {
  open: 'bg-blue-500',
  'in-progress': 'bg-yellow-500',
  resolved: 'bg-green-500',
  closed: 'bg-gray-500'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

function AnimatedDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setTickets(mockTickets);
      setStats(mockStats);
      setLoading(false);
    }, 1200);
  }, []);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <TicketIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  AI Help Desk
                </h1>
                <p className="text-sm text-gray-600">Smart ticket management</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChartBarIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalTickets}</p>
                <div className="flex items-center mt-2">
                  <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{stats?.ticketTrend}% this week</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <TicketIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.openTickets}</p>
                <div className="flex items-center mt-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-600">Needs attention</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <FireIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.resolvedToday}</p>
                <div className="flex items-center mt-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stats?.resolutionRate}% rate</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.avgResponseTime}</p>
                <div className="flex items-center mt-2">
                  <ClockIcon className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">Under target</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tickets List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Tickets</h2>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                      All
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      Open
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      Urgent
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {tickets.map((ticket, index) => (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        onClick={() => setSelectedTicket(ticket)}
                        className="p-4 bg-white/50 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-sm font-medium text-gray-500">#{ticket.id}</span>
                              <div className={`w-2 h-2 rounded-full ${statusColors[ticket.status]}`}></div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[ticket.priority]}`}>
                                {ticket.priority}
                              </span>
                            </div>

                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                              {ticket.title}
                            </h3>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {ticket.description}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center space-x-4">
                                <span>👤 {ticket.assignee}</span>
                                <span>🏢 {ticket.customer}</span>
                                <span>📂 {ticket.category}</span>
                              </div>
                              <span>{formatRelativeTime(ticket.updated)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  + New Ticket
                </button>
                <button className="w-full p-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  📊 View Analytics
                </button>
                <button className="w-full p-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  ⚙️ Settings
                </button>
              </div>
            </motion.div>

            {/* Team Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Status</h3>
              <div className="space-y-3">
                {[
                  { name: 'Sarah Chen', status: 'online', tickets: 8 },
                  { name: 'Mike Rodriguez', status: 'busy', tickets: 12 },
                  { name: 'Lisa Wang', status: 'online', tickets: 6 },
                  { name: 'David Kim', status: 'away', tickets: 4 }
                ].map((member) => (
                  <div key={member.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          member.status === 'online'
                            ? 'bg-green-500'
                            : member.status === 'busy'
                              ? 'bg-red-500'
                              : 'bg-gray-400'
                        }`}
                      ></div>
                      <span className="text-sm text-gray-700">{member.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{member.tickets} tickets</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Ticket #{selectedTicket.id}</h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedTicket.title}</h3>
                  <p className="text-gray-600">{selectedTicket.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${statusColors[selectedTicket.status]}`}></div>
                      <span className="text-sm capitalize">{selectedTicket.status}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority</label>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${priorityColors[selectedTicket.priority]}`}
                    >
                      {selectedTicket.priority}
                    </span>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Assignee</label>
                    <p className="text-sm mt-1">{selectedTicket.assignee}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer</label>
                    <p className="text-sm mt-1">{selectedTicket.customer}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-sm mt-1">{formatRelativeTime(selectedTicket.created)}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-sm mt-1">{selectedTicket.category}</p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Update Status
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Add Comment
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AnimatedDashboard;
