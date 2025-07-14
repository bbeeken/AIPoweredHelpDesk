import { ChangeEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface TicketFilter {
  status?: string;
  priority?: string;
}

interface FilterPreset {
  id: number;
  name: string;
  filters: TicketFilter;
}

interface Props {
  filters: TicketFilter;
  onChange: (f: TicketFilter) => void;
}

export default function TicketFilters({ filters, onChange }: Props) {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [name, setName] = useState('');

  useQuery({
    queryKey: ['filterPresets'],
    queryFn: async () => {
      try {
        const res = await fetch('/filters');
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // ignore errors and fall back to localStorage
      }
      const stored = localStorage.getItem('ticketFilterPresets');
      return stored ? JSON.parse(stored) : [];
    },
    onSuccess: (data) => setPresets(data),
  });

  async function savePreset() {
    if (!name.trim()) return;
    const preset: FilterPreset = { id: Date.now(), name: name.trim(), filters };
    let list = [...presets, preset];
    setPresets(list);
    localStorage.setItem('ticketFilterPresets', JSON.stringify(list));
    try {
      const res = await fetch('/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: preset.name, filters }),
      });
      if (res.ok) {
        const saved = await res.json();
        preset.id = saved.id;
        list = [...presets, preset];
        setPresets(list);
        localStorage.setItem('ticketFilterPresets', JSON.stringify(list));
      }
    } catch {
      // ignore
    }
    setName('');
  }

  function applyPreset(idStr: string) {
    const id = Number(idStr);
    const preset = presets.find(p => p.id === id);
    if (preset) onChange(preset.filters);
  }

  function handleStatus(e: ChangeEvent<HTMLSelectElement>) {
    onChange({ ...filters, status: e.target.value || undefined });
  }
  function handlePriority(e: ChangeEvent<HTMLSelectElement>) {
    onChange({ ...filters, priority: e.target.value || undefined });
  }
  return (
    <div className="flex flex-col gap-2 mb-2">
      <div className="flex gap-2">
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
      <div className="flex gap-2">
        <label htmlFor="viewSelect" className="sr-only">Saved views</label>
        <select id="viewSelect" className="border p-2" value="" onChange={e => applyPreset(e.target.value)}>
          <option value="">Saved views</option>
          {presets.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          aria-label="View name"
          className="border p-2"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="New view"
        />
        <button className="border px-3" onClick={savePreset}>Save</button>
      </div>
    </div>
  );
}
