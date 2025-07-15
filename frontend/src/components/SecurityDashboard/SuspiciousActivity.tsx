import { useEffect, useState } from 'react';

export default function SuspiciousActivity() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      setItems(list => [...list, `Suspicious IP 0.0.0.${list.length}`].slice(-10));
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <h3 className="font-semibold mb-2">Suspicious Activity</h3>
      <ul className="space-y-1 text-sm">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
