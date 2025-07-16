import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import AppSidebar from '../components/AppSidebar';
import KPICards from '../components/KPICards';
import TicketsTable from '../components/TicketsTable';
import RightSidebar from '../components/RightSidebar';
import FloatingActions from '../components/FloatingActions';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <AppHeader
          onMenuToggle={() => setSidebarOpen(o => !o)}
          menuOpen={sidebarOpen}
        />
        <main id="main" className="p-4 md:p-6">
          <KPICards />
          <div className="grid lg:grid-cols-4 gap-6 mt-6">
            <div className="lg:col-span-3 space-y-6">
              <TicketsTable />
            </div>
            <RightSidebar />
          </div>
        </main>
      </div>
      <FloatingActions />
    </div>
  );
}
