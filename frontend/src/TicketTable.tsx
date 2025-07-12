import { useEffect, useState } from 'react';

interface Ticket {
  id: number;
  question: string;
  status: string;
  priority: string;
}

export default function TicketTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sortField, setSortField] = useState<keyof Ticket>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const url = new URL('/tickets', window.location.origin);
    url.searchParams.set('sortBy', sortField);
    url.searchParams.set('order', sortOrder);
    fetch(url.toString())
      .then(res => res.json())
      .then(setTickets)
      .catch(err => console.error('Error loading tickets', err));
  }, [sortField, sortOrder]);

  function toggleSort(field: keyof Ticket) {
    if (sortField === field) {
      setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }

  return (
    <table className="table-auto border-collapse" style={{ width: '100%' }}>
      <thead>
        <tr>
          <th onClick={() => toggleSort('id')} style={{ cursor: 'pointer' }}>ID</th>
          <th onClick={() => toggleSort('question')} style={{ cursor: 'pointer' }}>Question</th>
          <th onClick={() => toggleSort('status')} style={{ cursor: 'pointer' }}>Status</th>
          <th onClick={() => toggleSort('priority')} style={{ cursor: 'pointer' }}>Priority</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map(t => (
          <tr key={t.id}>
            <td>{t.id}</td>
            <td>{t.question}</td>
            <td>{t.status}</td>
            <td>{t.priority}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
