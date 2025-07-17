import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  tickets: { open: number; waiting: number; closed: number };
  forecast: number;
  mttr: number;
  assets: { total: number };
}

function KPICard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow" role="status">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export default function KPICards() {
  const { data } = useQuery<DashboardStats>({
    queryKey: ["kpi"],
    queryFn: async () => {
      const res = await fetch("/stats/dashboard");
      return res.json();
    },
  });

  if (!data) return <p>Loading...</p>;

  const cards = [
    { label: "Open", value: data.tickets.open },
    { label: "Waiting", value: data.tickets.waiting },
    { label: "Closed", value: data.tickets.closed },
    { label: "Forecast", value: data.forecast.toFixed(1) },
    { label: "MTTR", value: `${data.mttr.toFixed(1)}h` },
    { label: "Assets", value: data.assets.total },
  ];

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-live="polite"
    >
      {cards.map((c) => (
        <KPICard key={c.label} label={c.label} value={c.value} />
      ))}
    </div>
  );
}
