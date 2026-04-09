'use client';

export default function DataTable({ entities, refresh, loading }) {
  return (
    <div className="overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Customer Records</h2>
          <p className="text-sm text-slate-500">Latest matching data from the system.</p>
        </div>
        <button
          onClick={refresh}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide text-slate-600">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide text-slate-600">Email</th>
            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide text-slate-600">Phone</th>
            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide text-slate-600">Source</th>
            <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wide text-slate-600">Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {entities.map((entity) => (
            <tr key={entity._id} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap text-slate-900">
                <div className="font-medium">{entity.firstName} {entity.lastName}</div>
                {entity.isGolden && (
                  <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    GOLDEN
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-600">{entity.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-600">{entity.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-600">{entity.sourceSystem}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-slate-900">
                {entity.goldenId ? 'Linked' : 'Source'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}