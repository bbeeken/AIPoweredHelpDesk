import { useEffect, useState } from 'react';

interface PriorityStats {
  [key: string]: number;
}

interface TimeSeriesData {
  date: string;
  tickets: number;
  resolved: number;
}

interface TeamPerformance {
  name: string;
  resolved: number;
  avgTime: string;
  satisfaction: number;
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [priorityStats, setPriorityStats] = useState<PriorityStats>({});
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);

  useEffect(() => {
    document.title = 'Analytics - AI Help Desk';
    loadAnalyticsData();
  }, [timeRange]);

  async function loadAnalyticsData() {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setPriorityStats({
        low: 45,
        medium: 78,
        high: 23,
        urgent: 12
      });
      
      setTimeSeriesData([
        { date: '2024-12-14', tickets: 45, resolved: 42 },
        { date: '2024-12-15', tickets: 52, resolved: 48 },
        { date: '2024-12-16', tickets: 38, resolved: 35 },
        { date: '2024-12-17', tickets: 61, resolved: 58 },
        { date: '2024-12-18', tickets: 44, resolved: 41 },
        { date: '2024-12-19', tickets: 55, resolved: 52 },
        { date: '2024-12-20', tickets: 48, resolved: 45 },
      ]);
      
      setTeamPerformance([
        { name: 'Sarah Chen', resolved: 89, avgTime: '2.1h', satisfaction: 4.9 },
        { name: 'Mike Johnson', resolved: 76, avgTime: '1.8h', satisfaction: 4.7 },
        { name: 'Lisa Wang', resolved: 82, avgTime: '2.3h', satisfaction: 4.8 },
        { name: 'David Lee', resolved: 71, avgTime: '2.0h', satisfaction: 4.6 },
        { name: 'Alex Rodriguez', resolved: 68, avgTime: '2.4h', satisfaction: 4.5 },
      ]);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  }

  const totalTickets = Object.values(priorityStats).reduce((sum, count) => sum + count, 0);
  const maxValue = Math.max(...timeSeriesData.map(d => Math.max(d.tickets, d.resolved)));

  if (loading) {
    return (
      <main className="p-6" id="main">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
          </div>
          
          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
          
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6" id="main">
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
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalTickets}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
            </div>
          </div>
        </div>

        {/* Time Series Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tickets Over Time</h3>
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">Created</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">Resolved</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between space-x-1">
            {timeSeriesData.map((data, index) => (
              <div key={data.date} className="flex-1 flex flex-col items-center space-y-1">
                <div className="w-full flex justify-center space-x-1">
                  <div 
                    className="bg-blue-500 rounded-t min-w-[8px] transition-all duration-500"
                    style={{ 
                      height: `${(data.tickets / maxValue) * 200}px`,
                      width: '12px'
                    }}
                    title={`Created: ${data.tickets}`}
                  ></div>
                  <div 
                    className="bg-green-500 rounded-t min-w-[8px] transition-all duration-500"
                    style={{ 
                      height: `${(data.resolved / maxValue) * 200}px`,
                      width: '12px'
                    }}
                    title={`Resolved: ${data.resolved}`}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 transform -rotate-45 origin-left">
                  {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Team Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Agent</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Tickets Resolved</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Avg. Response Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Satisfaction</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Performance</th>
              </tr>
            </thead>
            <tbody>
              {teamPerformance.map((member, index) => {
                const maxResolved = Math.max(...teamPerformance.map(m => m.resolved));
                const performanceScore = Math.round((member.resolved / maxResolved) * 100);
                
                return (
                  <tr key={member.name} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900 dark:text-white font-semibold">{member.resolved}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600 dark:text-gray-400">{member.avgTime}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <span className="text-gray-900 dark:text-white font-medium mr-2">{member.satisfaction}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(member.satisfaction) ? 'text-yellow-400' : 'text-gray-300'}`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${performanceScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{performanceScore}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}