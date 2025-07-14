import { useQuery } from "@tanstack/react-query";
import { Ticket } from "../store";

interface Props {
  ticketId: number | null;
  onClose: () => void;
}

export default function TicketDetailPanel({ ticketId, onClose }: Props) {
  const { data: ticket } = useQuery({
    queryKey: ["ticket", ticketId],
    enabled: ticketId !== null,
    queryFn: async () => {
      const res = await fetch(`/tickets/${ticketId}`);
      return (await res.json()) as Ticket;
    },
  });

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
              <ul className="list-disc list-inside text-sm">
                {ticket.history.map((h, i) => (
                  <li key={i}>
                    {h.date.slice(0, 10)} {h.action}
                    {h.from && h.to ? `: ${h.from} → ${h.to}` : ""}
                  </li>
                ))}
              </ul>
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
