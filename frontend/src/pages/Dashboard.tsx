import TicketTable from '../TicketTable';
import StatsPanel from '../components/StatsPanel';
import TicketFilters, { TicketFilter } from '../TicketFilters';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [filters, setFilters] = useState<TicketFilter>({});
  useEffect(() => {
    document.title = 'Dashboard - AI Help Desk';
  }, []);
  return (
    <main className="p-4" id="main">
      <StatsPanel />
      <TicketFilters filters={filters} onChange={setFilters} />
      <TicketTable filters={filters} />
    </main>
  );
}
