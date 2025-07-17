import { Select } from 'antd';

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  priority?: string;
  agent?: string;
}

interface Props {
  filters: AnalyticsFilters;
  onChange: (f: AnalyticsFilters) => void;
}

const { Option } = Select;

export default function AdvancedFilters({ filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-4 items-end mb-4">
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">From</label>
        <input
          type="date"
          value={filters.startDate || ''}
          onChange={e => onChange({ ...filters, startDate: e.target.value })}
          className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">To</label>
        <input
          type="date"
          value={filters.endDate || ''}
          onChange={e => onChange({ ...filters, endDate: e.target.value })}
          className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">Priority</label>
        <Select
          value={filters.priority || ''}
          onChange={val => onChange({ ...filters, priority: val || undefined })}
          style={{ width: 120 }}
        >
          <Option value="">All</Option>
          <Option value="low">Low</Option>
          <Option value="medium">Medium</Option>
          <Option value="high">High</Option>
          <Option value="urgent">Urgent</Option>
        </Select>
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 dark:text-gray-300 mb-1">Agent</label>
        <Select
          value={filters.agent || ''}
          onChange={val => onChange({ ...filters, agent: val || undefined })}
          style={{ width: 140 }}
        >
          <Option value="">All</Option>
          <Option value="Sarah">Sarah</Option>
          <Option value="Mike">Mike</Option>
          <Option value="Lisa">Lisa</Option>
          <Option value="David">David</Option>
        </Select>
      </div>
    </div>
  );
}
