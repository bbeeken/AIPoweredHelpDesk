import { useEffect, useState, lazy, Suspense } from 'react';
import { Select } from 'antd';

const StatusWidget = lazy(() => import('./widgets/StatusWidget'));
const ForecastWidget = lazy(() => import('./widgets/ForecastWidget'));

type WidgetId = 'status' | 'forecast';

const AVAILABLE_WIDGETS: { id: WidgetId; label: string }[] = [
  { id: 'status', label: 'Ticket Status' },
  { id: 'forecast', label: 'Ticket Forecast' },
];

function Widget({ id, onRemove }: { id: WidgetId; onRemove: () => void }) {
  switch (id) {
    case 'forecast':
      return <ForecastWidget onRemove={onRemove} />;
    case 'status':
    default:
      return <StatusWidget onRemove={onRemove} />;
  }
}

export default function StatsPanel() {
  const [widgets, setWidgets] = useState<WidgetId[]>(() => {
    const saved = localStorage.getItem('dashboardWidgets');
    return saved ? (JSON.parse(saved) as WidgetId[]) : ['status'];
  });
  const [next, setNext] = useState<WidgetId>('status');

  useEffect(() => {
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
  }, [widgets]);

  const addWidget = () => {
    if (!widgets.includes(next)) setWidgets([...widgets, next]);
  };

  const removeWidget = (id: WidgetId) => {
    setWidgets(widgets.filter(w => w !== id));
  };

  const available = AVAILABLE_WIDGETS.filter(w => !widgets.includes(w.id));

  return (
    <section className="mb-6" aria-live="polite">
      <h2 className="text-xl font-semibold mb-2">Dashboard Widgets</h2>
      <div className="mb-4">
        {available.length > 0 && (
          <>
            <label htmlFor="widgetSelect" className="mr-2">
              Add Widget:
            </label>
            <Select
              id="widgetSelect"
              value={next}
              onChange={value => setNext(value as WidgetId)}
              style={{ width: 160 }}
            >
              {available.map(w => (
                <Select.Option key={w.id} value={w.id}>
                  {w.label}
                </Select.Option>
              ))}
            </Select>
            <button
              onClick={addWidget}
              className="bg-primary dark:bg-primary-dark text-white px-2 py-0.5 rounded touch-target"
            >
              Add
            </button>
          </>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {widgets.map(id => (
          <Suspense key={id} fallback={<p>Loading...</p>}>
            <Widget id={id} onRemove={() => removeWidget(id)} />
          </Suspense>
        ))}
      </div>
    </section>
  );
}
