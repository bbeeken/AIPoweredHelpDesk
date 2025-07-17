import { useQuery } from "@tanstack/react-query";
import useRealtime from "../hooks/useRealtime";

interface Activity {
  id: string;
  user: { name: string; avatar?: string };
  message: string;
  timestamp: string;
}

function TeamActivityFeed() {
  const { data, refetch } = useQuery<Activity[]>({
    queryKey: ["activity"],
    queryFn: async () => {
      const res = await fetch("/api/activity");
      return res.json();
    },
  });
  useRealtime("activity", () => refetch());
  if (!data) return <p>Loading...</p>;
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow h-64 overflow-auto">
      <h2 className="font-semibold mb-2">Team Activity</h2>
      <ul className="space-y-2 text-sm">
        {data.map((a) => (
          <li key={a.id} className="border-b pb-1">
            <span className="font-medium">{a.user.name}</span> {a.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuickActionsPanel() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-2">
      <h2 className="font-semibold mb-2">Quick Actions</h2>
      <button className="w-full bg-blue-600 text-white rounded p-2">
        New Ticket
      </button>
      <button className="w-full bg-green-600 text-white rounded p-2">
        Bulk Assign
      </button>
      <button className="w-full bg-purple-600 text-white rounded p-2">
        Generate Report
      </button>
    </div>
  );
}

export default function RightSidebar() {
  return (
    <div className="space-y-6">
      <TeamActivityFeed />
      <QuickActionsPanel />
    </div>
  );
}
