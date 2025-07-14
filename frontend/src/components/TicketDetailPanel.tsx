import { useEffect, useState } from "react";
import TicketTimeline from "./TicketView/TicketTimeline";

interface Ticket {
  id: number;
  question: string;
  status: string;
  priority: string;
  history?: {
    action: string;
    from?: string;
    to?: string;
    by: number;
    date: string;
  }[];
  comments?: { id: number; userId: number; text: string; date: string }[];
}

interface Props {
  ticketId: number | null;
  onClose: () => void;
}

export default function TicketDetailPanel({ ticketId, onClose }: Props) {
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (ticketId === null) return;
    setTicket(null);
    async function load() {
      try {
        const res = await fetch(`/tickets/${ticketId}`);
        const data: Ticket = await res.json();
        setTicket(data);
      } catch (err) {
        console.error("Failed to load ticket", err);
      }
    }
    load();
  }, [ticketId]);

  if (ticketId === null) return null;

  return (
    <aside
      className="absolute top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 border-l shadow-lg p-4 overflow-y-auto"
      aria-label={`Details for ticket ${ticketId}`}
    >
      <button
        className="float-right"
        aria-label="Close panel"
        onClick={onClose}
      >
        ✖
      </button>
      {!ticket ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h3 className="font-semibold mb-2">Ticket {ticket.id}</h3>
          <p className="mb-2">{ticket.question}</p>
          <p className="mb-1">Status: {ticket.status}</p>
          <p className="mb-1">Priority: {ticket.priority}</p>
          {ticket.history && ticket.history.length > 0 && (
            <div className="mt-3">
              <h4 className="font-semibold">History</h4>
              <TicketTimeline history={ticket.history} />
            </div>
          )}
          {ticket.comments && ticket.comments.length > 0 && (
            <div className="mt-3">
              <h4 className="font-semibold">Comments</h4>
              <ul className="list-disc list-inside text-sm">
                {ticket.comments.map((c) => (
                  <li key={c.id}>{c.text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
