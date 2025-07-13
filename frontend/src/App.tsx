import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './components/CommandPalette';
import ToastContainer from './components/ToastContainer';

export default function App() {
  return (
    <BrowserRouter>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold">AI Help Desk</h1>
        <nav>
          <Link to="/" className="mr-4 text-blue-600 hover:underline">Dashboard</Link>
          <Link to="/analytics" className="mr-4 text-blue-600 hover:underline">Analytics</Link>
          <Link to="/settings" className="text-blue-600 hover:underline">Settings</Link>
        </nav>
        <ThemeToggle />
      </header>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <CommandPalette />
      <ToastContainer />
    </BrowserRouter>
  );
}
