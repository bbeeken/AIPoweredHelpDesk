import { create } from 'zustand';

export interface Ticket {
  id: number;
  question: string;
  status: string;
  priority: string;
}

interface TicketState {
  tickets: Ticket[];
  setTickets: (tickets: Ticket[]) => void;
}

export const useTicketStore = create<TicketState>((set) => ({
  tickets: [],
  setTickets: (tickets) => set({ tickets }),
}));

