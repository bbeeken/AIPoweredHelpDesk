import { useEffect, useState } from 'react';

interface FailedLogin {
  time: string;
  username: string;
}

export default function FailedLogins() {
  const [records, setRecords] = useState<FailedLogin[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      setRecords(r => [{ time: new Date().toLocaleTimeString(), username: 'demo' }, ...r].slice(0, 10));
    }, 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <h3 className="font-semibold mb-2">Failed Login Attempts</h3>
      <ul className="space-y-1 text-sm">
        {records.map((r, i) => (
          <li key={i}>{r.time} - {r.username}</li>
        ))}
      </ul>
    </div>
  );
}
