export default function ComplianceStatus() {
  return (
    <div>
      <h3 className="font-semibold mb-2">Compliance Status</h3>
      <ul className="text-sm space-y-1">
        <li>GDPR: In Compliance</li>
        <li>SOC 2: In Compliance</li>
        <li>HIPAA: N/A</li>
      </ul>
    </div>
  );
}
