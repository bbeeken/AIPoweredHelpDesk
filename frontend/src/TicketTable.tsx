import { useEffect, useState } from "react";
import TicketDetailPanel from "./components/TicketDetailPanel";
import { TicketFilter } from "./TicketFilters";

interface Ticket {
  id: number;
  question: string;
  status: string;
  priority: string;
}

interface Props {
  filters: TicketFilter;
}

export default function TicketTable({ filters }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sortField, setSortField] = useState<keyof Ticket>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const url = new URL("/tickets", window.location.origin);
      if (filters.status) url.searchParams.set("status", filters.status);
      if (filters.priority) url.searchParams.set("priority", filters.priority);
      url.searchParams.set("sortBy", sortField);
      url.searchParams.set("order", sortOrder);
      const res = await fetch(url.toString());
      const data = await res.json();
      setTickets(data);
    }
    load().catch((err) => console.error("Error loading tickets", err));

    if (window.EventSource) {
      const es = new EventSource("/events");
      es.addEventListener("ticketCreated", load);
      es.addEventListener("ticketUpdated", load);
      return () => es.close();
    }
  }, [filters, sortField, sortOrder]);

  function toggleSort(field: keyof Ticket) {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  return (
    <div className="relative" onMouseLeave={() => setActiveId(null)}>
      <table className="table-auto border-collapse" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th onClick={() => toggleSort("id")} style={{ cursor: "pointer" }}>
              ID
            </th>
            <th
              onClick={() => toggleSort("question")}
              style={{ cursor: "pointer" }}
            >
              Question
            </th>
            <th
              onClick={() => toggleSort("status")}
              style={{ cursor: "pointer" }}
            >
              Status
            </th>
            <th
              onClick={() => toggleSort("priority")}
              style={{ cursor: "pointer" }}
            >
              Priority
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr
              key={t.id}
              onMouseEnter={() => setActiveId(t.id)}
              onFocus={() => setActiveId(t.id)}
              onClick={() => setActiveId(t.id)}
              tabIndex={0}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <td>{t.id}</td>
              <td>{t.question}</td>
              <td>{t.status}</td>
              <td>{t.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <TicketDetailPanel
        ticketId={activeId}
        onClose={() => setActiveId(null)}
      />
    </div>
  );
}
