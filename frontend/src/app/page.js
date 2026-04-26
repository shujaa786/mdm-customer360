'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import { getApiBaseUrl } from '../lib/env';

const apiBaseUrl = getApiBaseUrl();

export default function Home() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntities = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl || 'http://localhost:5000'}/api/entities`);
      setEntities(res.data.entities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">MDM Customer 360</h1>
            <p className="mt-2 text-sm text-gray-600">A clean master data management dashboard view.</p>
          </div>
          <button
            onClick={fetchEntities}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-3 mb-10">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="mt-4 text-5xl font-bold text-gray-900">{entities.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-gray-500">Golden Records</p>
            <p className="mt-4 text-5xl font-bold text-emerald-600">{entities.filter(e => e.isGolden).length}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-gray-500">Duplicates Found</p>
            <p className="mt-4 text-5xl font-bold text-amber-600">3</p>
          </div>
        </div>

        <DataTable entities={entities} refresh={fetchEntities} loading={loading} />
      </main>
    </div>
  );
}