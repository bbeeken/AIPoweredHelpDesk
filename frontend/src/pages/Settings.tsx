import { useEffect, useState } from 'react';
import { Tabs, Switch } from 'antd';

export default function Settings() {
  const [email, setEmail] = useState(() => localStorage.getItem('notifyEmail') == 'true');
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
      <Tabs defaultActiveKey="notifications">
        <Tabs.TabPane tab="Notifications" key="notifications">
          <h2 className="text-xl font-semibold mb-2">Notification Settings</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <Switch checked={email} onChange={() => setEmail(!email)} />
              Email notifications
            </label>
            <label className="flex items-center gap-2">
              <Switch checked={push} onChange={() => setPush(!push)} />
              Push notifications
            </label>
            <p className="text-gray-500 text-sm">Preferences used when AI triage is enabled.</p>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Profile" key="profile">
          <h2 className="text-xl font-semibold mb-2">Profile Settings</h2>
          <p className="text-gray-500 text-sm">Profile settings coming soon.</p>
        </Tabs.TabPane>
      </Tabs>
    </main>
  );
}
