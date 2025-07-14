import { useCallback, useEffect, useState } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { useSwipeable } from 'react-swipeable';
import { Select, Button, Input } from 'antd';
import TicketDetailPanel from './components/TicketDetailPanel';
import { TicketFilter } from './TicketFilters';
import { showToast } from './components/toast';

interface Ticket {
  id: number;
  question: string;
  status: string;
  priority: string;
}

interface Props {
  filters: TicketFilter;
  tickets?: Ticket[];
}

const ROW_HEIGHT = 56;

export default function TicketTable({ filters, tickets: initial }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>(initial || []);
  const [sortField, setSortField] = useState<keyof Ticket>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<number[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkAssignee, setBulkAssignee] = useState('');

  const loadTickets = useCallback(async () => {
    if (initial) return;
    const url = new URL('/tickets', window.location.origin);
    if (filters.status) url.searchParams.set('status', filters.status);
    if (filters.priority) url.searchParams.set('priority', filters.priority);
    url.searchParams.set('sortBy', sortField);
    url.searchParams.set('order', sortOrder);
    const res = await fetch(url.toString());
    const data = await res.json();
    setTickets(data);
  }, [filters, sortField, sortOrder, initial]);

  useEffect(() => {
    loadTickets().catch(err => console.error('Error loading tickets', err));
    if (!initial && window.EventSource) {
      const es = new EventSource('/events');
      es.addEventListener('ticketCreated', loadTickets);
      es.addEventListener('ticketUpdated', loadTickets);
      return () => es.close();
    }
  }, [loadTickets, initial]);

  async function closeTicket(id: number) {
    const res = await fetch(`/tickets/${id}/close`, { method: 'POST' });
    if (res.ok) {
      showToast('Ticket closed');
      await loadTickets();
    }
  }

  async function assignTicket(id: number) {
    const res = await fetch(`/tickets/${id}/assign/1`, { method: 'POST' });
    if (res.ok) {
      showToast('Ticket assigned');
      await loadTickets();
    }
  }

  async function applyBulkStatus() {
    if (!bulkStatus) return;
    const res = await fetch('/tickets/bulk-update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected, status: bulkStatus }),
    });
    if (res.ok) {
      showToast('Updated tickets');
      setSelected([]);
      setBulkStatus('');
      await loadTickets();
    } else {
      showToast('Failed to update tickets');
    }
  }

  async function applyBulkAssign() {
    if (!bulkAssignee) return;
    const res = await fetch('/tickets/bulk-assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected, assigneeId: Number(bulkAssignee) }),
    });
    if (res.ok) {
      showToast('Assigned tickets');
      setSelected([]);
      setBulkAssignee('');
      await loadTickets();
    } else {
      showToast('Failed to assign tickets');
    }
  }

  const sorted = [...tickets].sort((a, b) => {
    const x = a[sortField];
    const y = b[sortField];
    if (x < y) return sortOrder === 'asc' ? -1 : 1;
    if (x > y) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  function toggleSelect(id: number, on: boolean) {
    setSelected(prev => (on ? [...prev, id] : prev.filter(i => i !== id)));
  }

  const Row = ({ index, style }: ListChildComponentProps) => {
    const t = sorted[index];
    const handlers = useSwipeable({
      onSwipedLeft: () => closeTicket(t.id),
      onSwipedRight: () => assignTicket(t.id),
    });
    return (
      <div
        {...handlers}
        style={style}
        className="grid grid-cols-[40px_60px_1fr_120px_120px] items-center border-b px-2"
        onMouseEnter={() => setActiveId(t.id)}
        onClick={() => setActiveId(t.id)}
      >
        <input
          type="checkbox"
          checked={selected.includes(t.id)}
          onChange={e => toggleSelect(t.id, e.target.checked)}
          className="mr-2"
        />
        <div>{t.id}</div>
        <div className="truncate">{t.question}</div>
        <div>{t.status}</div>
        <div>{t.priority}</div>
      </div>
    );
  };

  return (
    <div className="relative" onMouseLeave={() => setActiveId(null)}>
      {selected.length > 0 && (
        <div className="absolute top-0 left-0 right-0 bg-gray-200 dark:bg-gray-800 border-b p-2 flex flex-wrap gap-2 items-center z-10">
          <span>{selected.length} selected</span>
          <Select value={bulkStatus} onChange={setBulkStatus} style={{ width: 120 }}>
            <Select.Option value="">Status...</Select.Option>
            <Select.Option value="open">Open</Select.Option>
            <Select.Option value="waiting">Waiting</Select.Option>
            <Select.Option value="closed">Closed</Select.Option>
          </Select>
          <Button onClick={applyBulkStatus} className="touch-target">Update</Button>
          <Input
            placeholder="Assignee ID"
            type="number"
            value={bulkAssignee}
            onChange={e => setBulkAssignee(e.target.value)}
            style={{ width: 120 }}
          />
          <Button onClick={applyBulkAssign} className="touch-target">Assign</Button>
        </div>
      )}
      <div className="grid grid-cols-[40px_60px_1fr_120px_120px] font-semibold border-b bg-gray-50 dark:bg-gray-700">
        <div />
        <button className="text-left touch-target" onClick={() => setSortField('id')}>{sortField === 'id' && (sortOrder === 'asc' ? '▲ ' : '▼ ')}ID</button>
        <button className="text-left touch-target" onClick={() => setSortField('question')}>Question</button>
        <button className="text-left touch-target" onClick={() => setSortField('status')}>Status</button>
        <button className="text-left touch-target" onClick={() => setSortField('priority')}>Priority</button>
      </div>
      <List height={400} itemCount={sorted.length} itemSize={ROW_HEIGHT} width="100%">
        {Row}
      </List>
      <TicketDetailPanel ticketId={activeId} onClose={() => setActiveId(null)} />
    </div>
  );
}
