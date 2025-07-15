import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
  lastLogin: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

interface Ticket {
  id: number;
  question: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface Asset {
  id: number;
  name: string;
  type: string;
  serialNumber: string;
  assignedDate: string;
  status: 'active' | 'maintenance' | 'retired';
}

interface ActivityItem {
  id: number;
  type: 'ticket_created' | 'ticket_updated' | 'login' | 'asset_assigned';
  description: string;
  timestamp: string;
  metadata?: any;
}

// Mock data
const mockUser: User = {
  id: 1,
  name: "John Smith",
  email: "john.smith@company.com",
  role: "Senior Developer",
  department: "Engineering",
  joinDate: "2022-03-15T00:00:00Z",
  lastLogin: "2024-12-20T14:30:00Z",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  bio: "Experienced full-stack developer with a passion for creating efficient and scalable solutions. Specializes in React, Node.js, and cloud architecture."
};

const mockTickets: Ticket[] = [
  {
    id: 1001,
    question: "Unable to log in to customer portal",
    status: "open",
    priority: "high",
    createdAt: "2024-12-20T10:30:00Z",
    updatedAt: "2024-12-20T14:15:00Z"
  },
  {
    id: 998,
    question: "Request for new development environment",
    status: "closed",
    priority: "medium",
    createdAt: "2024-12-15T09:20:00Z",
    updatedAt: "2024-12-18T16:45:00Z"
  },
  {
    id: 995,
    question: "VPN connection issues",
    status: "closed",
    priority: "low",
    createdAt: "2024-12-10T11:15:00Z",
    updatedAt: "2024-12-12T13:30:00Z"
  }
];

const mockAssets: Asset[] = [
  {
    id: 1,
    name: "MacBook Pro 16-inch",
    type: "Laptop",
    serialNumber: "MBP-2023-001",
    assignedDate: "2023-03-15T00:00:00Z",
    status: "active"
  },
  {
    id: 2,
    name: "iPhone 14 Pro",
    type: "Mobile Device",
    serialNumber: "IPH-2023-042",
    assignedDate: "2023-09-20T00:00:00Z",
    status: "active"
  },
  {
    id: 3,
    name: "Dell Monitor 27-inch",
    type: "Monitor",
    serialNumber: "MON-2023-156",
    assignedDate: "2023-03-15T00:00:00Z",
    status: "maintenance"
  }
];

const mockActivity: ActivityItem[] = [
  {
    id: 1,
    type: "ticket_created",
    description: "Created ticket #1001: Unable to log in to customer portal",
    timestamp: "2024-12-20T10:30:00Z"
  },
  {
    id: 2,
    type: "login",
    description: "Logged in from Chrome on macOS",
    timestamp: "2024-12-20T09:15:00Z"
  },
  {
    id: 3,
    type: "ticket_updated",
    description: "Updated ticket #998: Request for new development environment",
    timestamp: "2024-12-18T16:45:00Z"
  },
  {
    id: 4,
    type: "asset_assigned",
    description: "iPhone 14 Pro assigned",
    timestamp: "2023-09-20T00:00:00Z"
  }
];

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    document.title = 'User Profile - AI Help Desk';
    loadUserData();
  }, [id]);

  async function loadUserData() {
    if (!id) return;
    
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setUser(mockUser);
      setTickets(mockTickets);
      setAssets(mockAssets);
      setActivity(mockActivity);
    } catch (err) {
      console.error('Failed to load user profile', err);
    } finally {
      setLoading(false);
    }
  }

  function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  }

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      closed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      retired: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      ticket_created: '🎫',
      ticket_updated: '📝',
      login: '🔐',
      asset_assigned: '💻'
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'tickets', label: 'Tickets', icon: '🎫' },
    { id: 'assets', label: 'Assets', icon: '💻' },
    { id: 'activity', label: 'Activity', icon: '📈' },
  ];

  if (loading) {
    return (
      <main className="p-6 max-w-6xl mx-auto" id="main">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-6 max-w-6xl mx-auto" id="main">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">User not found</h3>
          <p className="text-gray-600 dark:text-gray-400">The user you're looking for doesn't exist.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl mx-auto" id="main">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View user details, tickets, and activity
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user.name}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</p>
                <p className="text-sm text-gray-900 dark:text-white">{user.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</p>
                <p className="text-sm text-gray-900 dark:text-white">{user.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatRelativeTime(user.lastLogin)}</p>
              </div>
            </div>

            {user.bio && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Bio</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{user.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Profile tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors touch-target ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xl">🎫</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{tickets.length}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Total Tickets</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xl">💻</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{assets.filter(a => a.status === 'active').length}</p>
                    <p className="text-sm text-green-700 dark:text-green-300">Active Assets</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xl">📅</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {Math.floor((new Date().getTime() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Days Active</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              {tickets.length > 0 ? (
                tickets.map(ticket => (
                  <div key={ticket.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">#{ticket.id} - {ticket.question}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Created {formatRelativeTime(ticket.createdAt)} • Updated {formatRelativeTime(ticket.updatedAt)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🎫</div>
                  <p className="text-gray-500 dark:text-gray-400">No tickets found</p>
                </div>
              )}
            </div>
          )}

          {/* Assets Tab */}
          {activeTab === 'assets' && (
            <div className="space-y-4">
              {assets.length > 0 ? (
                assets.map(asset => (
                  <div key={asset.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{asset.name}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Type: </span>
                        <span className="text-gray-900 dark:text-white">{asset.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Serial: </span>
                        <span className="text-gray-900 dark:text-white">{asset.serialNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Assigned: </span>
                        <span className="text-gray-900 dark:text-white">{new Date(asset.assignedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💻</div>
                  <p className="text-gray-500 dark:text-gray-400">No assets assigned</p>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {activity.length > 0 ? (
                activity.map(item => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">{getActivityIcon(item.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">{item.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatRelativeTime(item.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}