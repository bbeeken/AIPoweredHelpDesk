import { useEffect, useState } from 'react';

export default function EventFeed() {
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      setEvents(ev => [...ev, `Event @ ${new Date().toLocaleTimeString()}`].slice(-20));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <h3 className="font-semibold mb-2">Security Events</h3>
      <ul className="space-y-1 text-sm">
        {events.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
