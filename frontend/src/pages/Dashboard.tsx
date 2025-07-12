import TicketTable from '../TicketTable';
import StatsPanel from '../components/StatsPanel';
import { useEffect } from 'react';

export default function Dashboard() {
  useEffect(() => {
    document.title = 'Dashboard - AI Help Desk';
  }, []);
  return (
    <main className="p-4" id="main">
      <StatsPanel />
      <TicketTable />
    </main>
  );
}
