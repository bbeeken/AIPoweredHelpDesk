import { useState } from 'react';
import TicketFilters, { TicketFilter } from '../../TicketFilters';
import TicketTable from '../../TicketTable';

export default function TicketSplitView() {
  const [filters, setFilters] = useState<TicketFilter>({});
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <TicketFilters filters={filters} onChange={setFilters} />
        <TicketTable filters={filters} />
      </div>
      <div className="hidden md:block p-2 border-l">
        <p className="text-gray-500">Select a ticket to view details.</p>
      </div>
    </div>
  );
}
