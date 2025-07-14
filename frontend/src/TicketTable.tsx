import { useEffect, useState, useCallback } from "react";
import TicketDetailPanel from "./components/TicketDetailPanel";
import { TicketFilter } from "./TicketFilters";
import { showToast } from "./components/toast";

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
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [activeId, setActiveId] = useState<number | null>(null);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkAssignee, setBulkAssignee] = useState("");

  const loadTickets = useCallback(async () => {
    const url = new URL("/tickets", window.location.origin);
    if (filters.status) url.searchParams.set("status", filters.status);
    if (filters.priority) url.searchParams.set("priority", filters.priority);
    if (filters.tags) url.searchParams.set("tag", filters.tags);
    url.searchParams.set("sortBy", sortField);
    url.searchParams.set("order", sortOrder);
    const res = await fetch(url.toString());
    const data = await res.json();
    setTickets(data);
  }, [filters, sortField, sortOrder]);

  useEffect(() => {
    loadTickets().catch((err) => console.error("Error loading tickets", err));

    if (window.EventSource) {
      const es = new EventSource("/events");
      es.addEventListener("ticketCreated", loadTickets);
      es.addEventListener("ticketUpdated", loadTickets);
      return () => es.close();
    }
  }, [loadTickets]);

  function toggleSort(field: keyof Ticket) {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  function toggleSelect(id: number) {
    setSelected((s) => {
      const copy = new Set(s);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
      }
      return copy;
    });
  }

  const allSelected =
    tickets.length > 0 && tickets.every((t) => selected.has(t.id));

  function toggleSelectAll(checked: boolean) {
    setSelected((s) => {
      const copy = new Set(s);
      if (checked) {
        tickets.forEach((t) => copy.add(t.id));
      } else {
        tickets.forEach((t) => copy.delete(t.id));
      }
      return copy;
    });
  }

  async function applyBulkStatus() {
    if (!bulkStatus) return;
    const res = await fetch("/tickets/bulk-update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected), status: bulkStatus }),
    });
    if (res.ok) {
      showToast("Updated tickets");
      setSelected(new Set());
      setBulkStatus("");
      await loadTickets();
    } else {
      showToast("Failed to update tickets");
    }
  }

  async function applyBulkAssign() {
    if (!bulkAssignee) return;
    const res = await fetch("/tickets/bulk-assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ids: Array.from(selected),
        assigneeId: Number(bulkAssignee),
      }),
    });
    if (res.ok) {
      showToast("Assigned tickets");
      setSelected(new Set());
      setBulkAssignee("");
      await loadTickets();
    } else {
      showToast("Failed to assign tickets");
    }
  }

  return (
    <div className="relative" onMouseLeave={() => setActiveId(null)}>
      {selected.size > 0 && (
        <div className="absolute top-0 left-0 right-0 bg-gray-200 dark:bg-gray-800 border-b p-2 flex flex-wrap gap-2 items-center">
          <span>{selected.size} selected</span>
          <select
            className="border p-1"
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
          >
            <option value="">Status...</option>
            <option value="open">Open</option>
            <option value="waiting">Waiting</option>
            <option value="closed">Closed</option>
          </select>
          <button className="border px-2" onClick={applyBulkStatus}>
            Update
          </button>
          <input
            className="border p-1"
            placeholder="Assignee ID"
            type="number"
            value={bulkAssignee}
            onChange={(e) => setBulkAssignee(e.target.value)}
          />
          <button className="border px-2" onClick={applyBulkAssign}>
            Assign
          </button>
        </div>
      )}

      <table className="table-auto border-collapse" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
            </th>
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
              <td>
                <input
                  type="checkbox"
                  checked={selected.has(t.id)}
                  onChange={() => toggleSelect(t.id)}
                />
              </td>
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
