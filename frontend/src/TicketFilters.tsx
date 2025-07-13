import { ChangeEvent } from 'react';

export interface TicketFilter {
  status?: string;
  priority?: string;
}

interface Props {
  filters: TicketFilter;
  onChange: (f: TicketFilter) => void;
}

export default function TicketFilters({ filters, onChange }: Props) {
  function handleStatus(e: ChangeEvent<HTMLSelectElement>) {
    onChange({ ...filters, status: e.target.value || undefined });
  }
  function handlePriority(e: ChangeEvent<HTMLSelectElement>) {
    onChange({ ...filters, priority: e.target.value || undefined });
  }
  return (
    <div className="flex gap-2 mb-2">
      <label htmlFor="statusFilter" className="sr-only">Status</label>
      <select id="statusFilter" className="border p-2" value={filters.status || ''} onChange={handleStatus}>
        <option value="">All statuses</option>
        <option value="open">Open</option>
        <option value="waiting">Waiting</option>
        <option value="closed">Closed</option>
      </select>
      <label htmlFor="priorityFilter" className="sr-only">Priority</label>
      <select id="priorityFilter" className="border p-2" value={filters.priority || ''} onChange={handlePriority}>
        <option value="">All priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  );
}
