import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './components/CommandPalette';
import Sidebar from './components/Sidebar';

export default function App() {
  return (
    <BrowserRouter>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <Sidebar />
          <h1 className="text-2xl font-bold">AI Help Desk</h1>
        </div>
        <ThemeToggle />
      </header>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
      <CommandPalette />
    </BrowserRouter>
  );
}
