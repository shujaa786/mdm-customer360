'use client';
import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import socket from '../lib/socket';
import { apiClient } from '../lib/api/client';
import { endpoints } from '../lib/api/endpoints';

const RECORDS_PER_PAGE = 10;

export default function Home() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [duplicates, setDuplicates] = useState(0);

  const fetchEntities = async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get(
        `${endpoints.entities.list()}?page=${page}&limit=${RECORDS_PER_PAGE}`
      );
      setEntities(res.entities || []);
      setPagination(res.pagination || {});
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDuplicates = async () => {
    try {
      const res = await apiClient.post(endpoints.match.match());
      setDuplicates(res.matchCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) fetchEntities(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) fetchEntities(currentPage - 1);
  };

  useEffect(() => {
    fetchEntities(1);
    fetchDuplicates();
  }, []);

  useEffect(() => {
    const onIngestComplete = () => {
      fetchEntities(1);
      fetchDuplicates();
    };

    socket.on('ingest-complete', onIngestComplete);
    return () => socket.off('ingest-complete', onIngestComplete);
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
            onClick={() => fetchEntities(currentPage)}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-3 mb-10">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="mt-4 text-5xl font-bold text-gray-900">{pagination.totalRecords}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-gray-500">Golden Records</p>
            <p className="mt-4 text-5xl font-bold text-emerald-600">{entities.filter(e => e.isGolden).length}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-gray-500">Duplicates Found</p>
            <p className="mt-4 text-5xl font-bold text-amber-600">{duplicates}</p>
          </div>
        </div>

        <DataTable entities={entities} refresh={() => fetchEntities(currentPage)} loading={loading} />

        {/* Pagination Controls */}
        <div className="mt-6 flex items-center justify-between rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="text-sm text-slate-600">
            Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-900">{pagination.totalPages}</span> •{' '}
            <span className="font-semibold text-slate-900">{pagination.totalRecords}</span> total records
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrevPage}
              disabled={!pagination.hasPrevPage || loading}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-slate-200"
            >
              ← Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage || loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-blue-700"
            >
              Next →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
