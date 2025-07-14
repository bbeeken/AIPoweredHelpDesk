import { useState } from 'react';

interface Message {
  id: number;
  userId: number;
  text: string;
  attachments?: { id: number; name: string; url: string }[];
}

export default function ConversationView({ messages }: { messages: Message[] }) {
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState('');

  function startEdit(m: Message) {
    setEditing(m.id);
    setDraft(m.text);
  }

  function save() {
    // stub for saving edited message
    setEditing(null);
  }

  return (
    <div className="space-y-2">
      {messages.map(m => (
        <div key={m.id} className={`p-2 rounded ${m.userId === 1 ? 'bg-blue-100 self-end' : 'bg-gray-100'}`}>\
          {editing === m.id ? (
            <div>
              <input className="border p-1" value={draft} onChange={e => setDraft(e.target.value)} />
              <button className="ml-2" onClick={save}>Save</button>
            </div>
          ) : (
            <div onDoubleClick={() => startEdit(m)}>
              <p>{m.text}</p>
              {m.attachments && (
                <ul className="text-sm mt-1">
                  {m.attachments.map(a => (
                    <li key={a.id}><a href={a.url} className="text-blue-600 underline">{a.name}</a></li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))}
      <p className="text-gray-500" aria-live="polite">Someone is typing...</p>
    </div>
  );
}
