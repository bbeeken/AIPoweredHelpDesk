import { useEffect, useState, useCallback } from 'react';
import { Table, Select, Button, Input } from 'antd';
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
}

export default function TicketTable({ filters }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sortField, setSortField] = useState<keyof Ticket>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<React.Key[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkAssignee, setBulkAssignee] = useState('');

  const loadTickets = useCallback(async () => {

 
    const url = new URL('/tickets', window.location.origin);
    if (filters.status) url.searchParams.set('status', filters.status);
    if (filters.priority) url.searchParams.set('priority', filters.priority);
    url.searchParams.set('sortBy', sortField);
    url.searchParams.set('order', sortOrder);
    const res = await fetch(url.toString());
    const data = await res.json();
    setTickets(data);
  }, [filters, sortField, sortOrder]);

  useEffect(() => {
    loadTickets().catch(err => console.error('Error loading tickets', err));
    if (window.EventSource) {
      const es = new EventSource('/events');
      es.addEventListener('ticketCreated', loadTickets);
      es.addEventListener('ticketUpdated', loadTickets);
      return () => es.close();
    }
  }, [loadTickets]);

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

  const columns = [
    { title: 'ID', dataIndex: 'id', sorter: true },
    {
      title: 'Question',
      dataIndex: 'question',
      sorter: true,
      render: (_: any, record: any) => (
        <span>
          {record.question}
          {record.originalQuestion && record.originalQuestion !== record.question && (
            <span className="block text-xs text-gray-500">({record.originalQuestion})</span>
          )}
        </span>
      ),
    },
    { title: 'Status', dataIndex: 'status', sorter: true },
    { title: 'Priority', dataIndex: 'priority', sorter: true },
  ];

  return (
    <div className="relative" onMouseLeave={() => setActiveId(null)}>
      {selected.length > 0 && (
        <div className="absolute top-0 left-0 right-0 bg-gray-200 dark:bg-gray-800 border-b p-2 flex flex-wrap gap-2 items-center z-10">
          <span>{selected.length} selected</span>
          <Select
            value={bulkStatus}
            onChange={setBulkStatus}
            style={{ width: 120 }}
          >
            <Select.Option value="">Status...</Select.Option>
            <Select.Option value="open">Open</Select.Option>
            <Select.Option value="waiting">Waiting</Select.Option>
            <Select.Option value="closed">Closed</Select.Option>
          </Select>
          <Button onClick={applyBulkStatus}>Update</Button>
          <Input
            placeholder="Assignee ID"
            type="number"
            value={bulkAssignee}
            onChange={e => setBulkAssignee(e.target.value)}
            style={{ width: 120 }}
          />
          <Button onClick={applyBulkAssign}>Assign</Button>
        </div>
      )}

      <Table
        rowKey="id"
        dataSource={tickets}
        columns={columns}
        pagination={false}
        rowSelection={{ selectedRowKeys: selected, onChange: keys => setSelected(keys) }}
        onChange={(pagination, filters, sorter) => {
          const s = sorter as any;
          if (s.field) {
            setSortField(s.field);
            setSortOrder(s.order === 'ascend' ? 'asc' : 'desc');
          }
        }}
        onRow={record => ({
          onMouseEnter: () => setActiveId(record.id),
          onClick: () => setActiveId(record.id),
        })}
      />
      <TicketDetailPanel ticketId={activeId} onClose={() => setActiveId(null)} />
    </div>
  );
}
