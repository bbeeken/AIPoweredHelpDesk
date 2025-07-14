import { useState } from 'react';

interface Props {
  selected: number[];
  onDone: () => void;
}

export default function BulkActions({ selected, onDone }: Props) {
  const [status, setStatus] = useState('');
  const [assignee, setAssignee] = useState('');

  async function applyStatus() {
    if (!status) return;
    await fetch('/tickets/bulk-update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected, status }),
    });
    setStatus('');
    onDone();
  }

  async function applyAssign() {
    if (!assignee) return;
    await fetch('/tickets/bulk-assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected, assigneeId: Number(assignee) }),
    });
    setAssignee('');
    onDone();
  }

  if (selected.length === 0) return null;
  return (
    <div className="bg-gray-200 dark:bg-gray-800 border-b p-2 flex flex-wrap gap-2 items-center">
      <span>{selected.length} selected</span>
      <select className="border p-1" value={status} onChange={e => setStatus(e.target.value)}>
        <option value="">Status...</option>
        <option value="open">Open</option>
        <option value="waiting">Waiting</option>
        <option value="closed">Closed</option>
      </select>
      <button className="border px-2" onClick={applyStatus}>Update</button>
      <input className="border p-1" placeholder="Assignee" value={assignee} onChange={e => setAssignee(e.target.value)} />
      <button className="border px-2" onClick={applyAssign}>Assign</button>
    </div>
  );
}
