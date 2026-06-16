export default function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">OpsMind AI Dashboard</h1>
      <p className="mt-2 text-gray-500">Incident Memory Engine</p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Active Incidents</p>
          <h2 className="text-3xl font-bold">12</h2>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Resolved</p>
          <h2 className="text-3xl font-bold">84</h2>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Critical</p>
          <h2 className="text-3xl font-bold">3</h2>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">MTTR</p>
          <h2 className="text-3xl font-bold">18m</h2>
        </div>
      </div>
    </main>
  );
}