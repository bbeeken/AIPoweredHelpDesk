import { useEffect, useState } from 'react';

export default function Settings() {
  const [email, setEmail] = useState(() => localStorage.getItem('notifyEmail') === 'true');
  const [push, setPush] = useState(() => localStorage.getItem('notifyPush') === 'true');

  useEffect(() => {
    localStorage.setItem('notifyEmail', email ? 'true' : 'false');
  }, [email]);

  useEffect(() => {
    localStorage.setItem('notifyPush', push ? 'true' : 'false');
  }, [push]);

  useEffect(() => {
    document.title = 'Settings - AI Help Desk';
  }, []);

  return (
    <main className="p-4" id="main">
      <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
      <form className="space-y-2">
        <label className="flex items-center">
          <input type="checkbox" checked={email} onChange={() => setEmail(!email)} />
          <span className="ml-2">Email notifications</span>
        </label>
        <label className="flex items-center">
          <input type="checkbox" checked={push} onChange={() => setPush(!push)} />
          <span className="ml-2">Push notifications</span>
        </label>
        <p className="text-gray-500 text-sm">Preferences used when AI triage is enabled.</p>
      </form>
    </main>
  );
}
