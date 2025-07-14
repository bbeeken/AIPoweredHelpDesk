import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ToastContainer from './components/ToastContainer';
import UserProfile from './pages/UserProfile';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './components/CommandPalette';
import Sidebar from './components/Sidebar';
import { useTheme } from './hooks/useTheme';

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
            <Link to="/" className="mr-4 text-blue-600 hover:underline">Dashboard</Link>
            <Link to="/analytics" className="mr-4 text-blue-600 hover:underline">Analytics</Link>
            <Link to="/settings" className="text-blue-600 hover:underline">Settings</Link>
            <Link to="/users/1" className="text-blue-600 hover:underline">Profile</Link>
          </nav>
          <ThemeToggle />
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/users/:id" element={<UserProfile />} />
        </Routes>
        <CommandPalette />
        <ToastContainer />
      </BrowserRouter>
    </ConfigProvider>
  );
}
