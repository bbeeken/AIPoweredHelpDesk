import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import UserProfile from './pages/UserProfile';
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

        <h1 className="text-2xl font-bold">AI Help Desk</h1>
        <nav>
          <Link to="/" className="mr-4 text-blue-600 hover:underline">Dashboard</Link>
          <Link to="/analytics" className="mr-4 text-blue-600 hover:underline">Analytics</Link>
          <Link to="/users/1" className="text-blue-600 hover:underline">Profile</Link>
        </nav>
        <ThemeToggle />
      </header>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/users/:id" element={<UserProfile />} />
      </Routes>
      <CommandPalette />
    </BrowserRouter>
  );
}
