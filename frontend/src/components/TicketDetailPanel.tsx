

import { useQuery } from "@tanstack/react-query";
import { Ticket } from "../store";


import { useEffect, useState } from "react";
import AIAssistant from "./AIAssistant";

import TicketTimeline from "./TicketView/TicketTimeline";


import { Drawer } from 'antd';
import AIAssistant from './AIAssistant';
import TicketTimeline from './TicketView/TicketTimeline';

interface Ticket {
  id: number;
  question: string;
  status: string;
  priority: string;
  originalQuestion?: string;
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
        console.error('Failed to load ticket', err);
      }
    }
    load();
  }, [ticketId]);

  return (
    <Drawer
      placement="right"
      width={320}
      onClose={onClose}
      open={ticketId !== null}
      title={`Ticket ${ticketId}`}
    >
      {!ticket ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p className="mb-2">
            {ticket.question}
            {ticket.originalQuestion && ticket.originalQuestion !== ticket.question && (
              <span className="block text-xs text-gray-500">(Original: {ticket.originalQuestion})</span>
            )}
          </p>
          <p className="mb-1">Status: {ticket.status}</p>
          <p className="mb-1">Priority: {ticket.priority}</p>
          {ticket.history && ticket.history.length > 0 && (
            <div className="mt-3">
              <h4 className="font-semibold">History</h4>
              <TicketTimeline history={ticket.history} />
              <ul className="list-disc list-inside text-sm">
                {ticket.history.map((h, i) => (
                  <li key={i}>
                    {h.date.slice(0, 10)} {h.action}
                    {h.from && h.to ? `: ${h.from} → ${h.to}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {ticket.comments && ticket.comments.length > 0 && (
            <div className="mt-3">
              <h4 className="font-semibold">Comments</h4>
              <ul className="list-disc list-inside text-sm">
                {ticket.comments.map(c => (
                  <li key={c.id}>{c.text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <AIAssistant ticket={ticket} />
    </Drawer>
  );
}
