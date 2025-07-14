import { useEffect, useRef, useState } from 'react';

export default function Settings() {
  const [email, setEmail] = useState(
    () => localStorage.getItem('notifyEmail') == 'true'
  );
  const [push, setPush] = useState(
    () => localStorage.getItem('notifyPush') === 'true'
  );
  const [activeTab, setActiveTab] = useState<'notifications' | 'profile'>(
    'notifications'
  );
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    localStorage.setItem('notifyEmail', email ? 'true' : 'false');
  }, [email]);

  useEffect(() => {
    localStorage.setItem('notifyPush', push ? 'true' : 'false');
  }, [push]);

  useEffect(() => {
    document.title = 'Settings - AI Help Desk';
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const tabs = ['notifications', 'profile'] as const;
    const index = tabs.indexOf(activeTab);
    if (e.key === 'ArrowRight') {
      const next = (index + 1) % tabs.length;
      setActiveTab(tabs[next]);
      tabRefs.current[next]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const prev = (index - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prev]);
      tabRefs.current[prev]?.focus();
      e.preventDefault();
    }
  }

  return (
    <main className="p-4" id="main">
      <div
        className="mb-4 border-b flex space-x-4"
        role="tablist"
        aria-label="Settings sections"
        onKeyDown={handleKeyDown}
      >
        {['notifications', 'profile'].map((id, idx) => (
          <button
            key={id}
            id={`tab-${id}`}
            role="tab"
            ref={el => (tabRefs.current[idx] = el)}
            aria-selected={activeTab === id}
            aria-controls={`panel-${id}`}
            className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
              activeTab === id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            tabIndex={activeTab === id ? 0 : -1}
            onClick={() => setActiveTab(id as 'notifications' | 'profile')}
          >
            {id === 'notifications' ? 'Notifications' : 'Profile'}
          </button>
        ))}
      </div>

      <div
        id="panel-notifications"
        role="tabpanel"
        aria-labelledby="tab-notifications"
        hidden={activeTab !== 'notifications'}
        className="space-y-2"
      >
        <h2 className="text-xl font-semibold mb-2">Notification Settings</h2>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={email}
            onChange={() => setEmail(!email)}
          />
          <span className="ml-2">Email notifications</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={push}
            onChange={() => setPush(!push)}
          />
          <span className="ml-2">Push notifications</span>
        </label>
        <p className="text-gray-500 text-sm">
          Preferences used when AI triage is enabled.
        </p>
      </div>

      <div
        id="panel-profile"
        role="tabpanel"
        aria-labelledby="tab-profile"
        hidden={activeTab !== 'profile'}
        className="space-y-2"
      >
        <h2 className="text-xl font-semibold mb-2">Profile Settings</h2>
        <p className="text-gray-500 text-sm">Profile settings coming soon.</p>
      </div>
    </main>
  );
}

