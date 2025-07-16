import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { lazy, Suspense } from 'react';
import ToastContainer from './components/ToastContainer';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './components/CommandPalette';
import Sidebar from './components/Sidebar';
import { useTheme } from './hooks/useTheme';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AnimatedDashboard = lazy(() => import('./pages/AnimatedDashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const UserProfile = lazy(() => import('./pages/UserProfile'));

export default function App() {
  const { algorithm } = useTheme();
  return (
    <ConfigProvider theme={{ algorithm }}>
      <BrowserRouter>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="flex justify-between items-center py-4">

        <div className="flex items-center gap-2">
          <Sidebar />
          <h1 className="text-2xl font-bold">AI Help Desk</h1>
        </div>
        <nav>
          <Link to="/" className="mr-4 text-primary dark:text-primary-dark hover:underline">Dashboard</Link>
          <Link to="/analytics" className="mr-4 text-primary dark:text-primary-dark hover:underline">Analytics</Link>

          <Link to="/settings" className="text-primary dark:text-primary-dark hover:underline">Settings</Link>

          <Link to="/users/1" className="text-primary dark:text-primary-dark hover:underline">Profile</Link>

        </nav>
        <ThemeToggle />
      </header>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/animated-dashboard" element={<AnimatedDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/users/:id" element={<UserProfile />} />
        </Routes>
      </Suspense>
      <CommandPalette />
      <ToastContainer />
      </BrowserRouter>
    </ConfigProvider>
  );
}
