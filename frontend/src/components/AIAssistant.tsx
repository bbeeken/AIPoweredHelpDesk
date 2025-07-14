import { useState } from 'react';

interface Ticket {
  id: number;
  question: string;
}

function categorize(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('password')) return 'authentication';
  if (t.includes('error')) return 'incident';
  return 'general';
}

export default function AIAssistant({ ticket }: { ticket: Ticket | null }) {
  const [open, setOpen] = useState(false);
  if (!ticket) return null;

  const category = categorize(ticket.question);
  const templates: Record<string, string> = {
    authentication: 'Please reset your password using the portal.',
    incident: 'We are investigating the error you reported.',
    general: 'Thank you for contacting support.',
  };
  const sentiment = /thank|great|love/i.test(ticket.question) ? 'positive' : /hate|terrible|bad/i.test(ticket.question) ? 'negative' : 'neutral';
  const next = category === 'incident' ? 'Escalate to engineering if unresolved.' : 'Reply to the user.';

  return (
    <div className="fixed bottom-4 left-4">
      {!open && (
        <button onClick={() => setOpen(true)} className="bg-blue-600 text-white px-3 py-1 rounded">
          AI
        </button>
      )}
      {open && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow w-64">
          <button className="float-right" onClick={() => setOpen(false)}>
            ✕
          </button>
          <h4 className="font-semibold mb-2">AI Assistant</h4>
          <p className="mb-1 text-sm">Category: {category}</p>
          <p className="mb-1 text-sm">Sentiment: {sentiment}</p>
          <p className="mb-2 text-sm">Suggestion: {templates[category]}</p>
          <p className="text-sm">Next: {next}</p>
        </div>
      )}
    </div>
  );
}
