import { useEffect, useState } from 'react';
import { Select, Input, Button } from 'antd';

export interface TicketFilter {
  status?: string;
  priority?: string;
  tags?: string;
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

const { Option } = Select;

export default function TicketFilters({ filters, onChange }: Props) {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/filters');
        if (res.ok) {
          setPresets(await res.json());
          return;
        }
      } catch {
        // ignore errors and fall back to localStorage
      }
      const stored = localStorage.getItem('ticketFilterPresets');
      if (stored) setPresets(JSON.parse(stored));
    }
    load();
  }, []);

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
  function handleTags(e: ChangeEvent<HTMLInputElement>) {
    onChange({ ...filters, tags: e.target.value || undefined });
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
        <input
          id="tagFilter"
          className="border p-2 flex-1"
          placeholder="Tags"
          value={filters.tags || ''}
          onChange={handleTags}
        />

  return (
    <div className="flex flex-col gap-2 mb-2">
      <div className="flex gap-2 items-center">
        <Select
          aria-label="Status"
          value={filters.status || ''}
          onChange={value => onChange({ ...filters, status: value || undefined })}
          style={{ width: 140 }}
        >
          <Option value="">All statuses</Option>
          <Option value="open">Open</Option>
          <Option value="waiting">Waiting</Option>
          <Option value="closed">Closed</Option>
        </Select>
        <Select
          aria-label="Priority"
          value={filters.priority || ''}
          onChange={value => onChange({ ...filters, priority: value || undefined })}
          style={{ width: 140 }}
        >
          <Option value="">All priorities</Option>
          <Option value="low">Low</Option>
          <Option value="medium">Medium</Option>
          <Option value="high">High</Option>
        </Select>

      </div>
      <div className="flex gap-2 items-center">
        <Select
          aria-label="Saved views"
          value=""
          onChange={applyPreset}
          style={{ width: 160 }}
        >
          <Option value="">Saved views</Option>
          {presets.map(p => (
            <Option key={p.id} value={String(p.id)}>{p.name}</Option>
          ))}
        </Select>
        <Input
          aria-label="View name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="New view"
          style={{ width: 160 }}
        />
        <Button onClick={savePreset} className="touch-target">Save</Button>
      </div>
    </div>
  );
}
