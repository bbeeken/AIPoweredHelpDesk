import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Ticket {
  id: number;
  question: string;
  status: string;
}

interface Asset {
  id: number;
  name: string;
}

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    document.title = 'User Profile - AI Help Desk';
  }, []);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const [tRes, aRes] = await Promise.all([
        fetch(`/users/${id}/tickets`),
        fetch(`/users/${id}/assets`),
      ]);
      setTickets(await tRes.json());
      setAssets(await aRes.json());
    }
    load().catch(err => console.error('Failed to load profile', err));
  }, [id]);

  return (
    <main className="p-4" id="main">
      <h2 className="text-xl font-semibold mb-4">User {id}</h2>
      <section className="mb-6">
        <h3 className="font-semibold mb-2">Tickets</h3>
        <ul className="list-disc pl-5">
          {tickets.map(t => (
            <li key={t.id}>#{t.id} - {t.question} [{t.status}]</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="font-semibold mb-2">Assets</h3>
        <ul className="list-disc pl-5">
          {assets.map(a => (
            <li key={a.id}>{a.name}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
