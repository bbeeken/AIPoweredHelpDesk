import StatsPanel from '../components/StatsPanel';
import TicketSplitView from '../components/TicketView/TicketSplitView';
import SmartSearch from '../components/SmartSearch';
import { useEffect } from 'react';

export default function Dashboard() {
  useEffect(() => {
    document.title = 'Dashboard - AI Help Desk';
  }, []);
  return (
    <main className="p-4" id="main">
      <StatsPanel />
      <TicketSplitView />
      <SmartSearch />
    </main>
  );
}
