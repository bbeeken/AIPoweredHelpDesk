import EventFeed from './EventFeed';
import FailedLogins from './FailedLogins';
import SuspiciousActivity from './SuspiciousActivity';
import ComplianceStatus from './ComplianceStatus';

export default function SecurityDashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Security Dashboard</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <EventFeed />
        <FailedLogins />
        <SuspiciousActivity />
        <ComplianceStatus />
      </div>
    </div>
  );
}
