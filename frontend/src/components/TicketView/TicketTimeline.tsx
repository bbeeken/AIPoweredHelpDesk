interface Item {
  action: string;
  from?: string;
  to?: string;
  by: number;
  date: string;
}

function icon(action: string) {
  switch (action) {
    case 'status':
      return '📌';
    case 'assignee':
      return '👤';
    case 'priority':
      return '⚠️';
    case 'dueDate':
      return '📅';
    default:
      return '✏️';
  }
}

export default function TicketTimeline({ history }: { history: Item[] }) {
  if (!history?.length) return null;
  return (
    <ul className="text-sm space-y-1">
      {history.map((h, i) => (
        <li key={i} className="flex items-start gap-1">
          <span>{icon(h.action)}</span>
          <span>
            {h.date.slice(0, 10)} {h.action}
            {h.from && h.to ? `: ${h.from} → ${h.to}` : ''}
          </span>
        </li>
      ))}
    </ul>
  );
}
