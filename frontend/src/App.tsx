import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import ThemeToggle from './ThemeToggle';

export default function App() {
  return (
    <BrowserRouter>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold">AI Help Desk</h1>
        <nav>
          <Link to="/" className="mr-4 text-blue-600 hover:underline">Dashboard</Link>
          <Link to="/analytics" className="text-blue-600 hover:underline">Analytics</Link>
        </nav>
        <ThemeToggle />
      </header>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}
