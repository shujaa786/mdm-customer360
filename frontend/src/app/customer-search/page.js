'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import Toast from '../../components/Toast';
import { apiClient } from '../../lib/api/client';
import { endpoints } from '../../lib/api/endpoints';
export default function CustomerSearchPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    message: '',
    type: 'info'
  });
  const fetchCustomers = async (query = '') => {
    setLoading(true);
    try {
      const res = await apiClient.get(
        `${endpoints.entities.search()}?q=${encodeURIComponent(query)}`
      );
      setCustomers(res.entities || []);
    } catch (err) {
      setToast({
        message: err.message || 'Failed to load customers.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCustomers();
  }, []);
  return (
    <ProtectedRoute
      allowedRoles={[
        'SUPER_ADMIN',
        'DATA_STEWARD',
        'BUSINESS_USER'
      ]}
    >
      <div className="min-h-screen bg-slate-50">
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast({
              message: '',
              type: 'info'
            })
          }
        />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Customer Search
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Search and access Customer 360 profiles.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone"
                className="w-full md:w-96 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-blue-500 focus:ring-2"
              />
              <button
                onClick={() => fetchCustomers(search)}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Source
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-sm text-slate-500"
                    >
                      Loading customers...
                    </td>
                  </tr>
                )}
                {!loading && customers.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-sm text-slate-500"
                    >
                      No customers found.
                    </td>
                  </tr>
                )}
                {customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {customer.firstName} {customer.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {customer.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {customer.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {customer.sourceSystem}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/customer/${customer._id}`}
                        className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
                      >
                        Open Customer 360
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}