'use client';
import axios from 'axios';
import socket from '../../lib/socket';
import { useEffect, useState } from 'react';
import { getApiBaseUrl } from '../../lib/env';

const apiBaseUrl = getApiBaseUrl();

export default function IngestPage() {
    const [file, setFile] = useState(null);
    const [mode, setMode] = useState('replace');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const runRequest = async (requestFn) => {
        try {
            setLoading(true);
            const res = await requestFn();
            alert(`✅ ${res.data.message}`);
        } catch (error) {
            alert(`❌ ${error?.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadIngest = async () => {
        if (!file) {
            alert('Please select a CSV file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('mode', mode);

        await runRequest(() => axios.post(
            `${apiBaseUrl || 'http://localhost:5000'}/api/ingest/upload?mode=${mode}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        ));
    };

    const handleUrlIngest = async () => {
        if (!url.trim()) {
            alert('Please enter a CSV URL.');
            return;
        }

        await runRequest(() => axios.post(
            `${apiBaseUrl || 'http://localhost:5000'}/api/ingest/url?mode=${mode}`,
            { csvUrl: url, mode }
        ));
    };

    const handleLegacyServerIngest = async () => {
        await runRequest(() => axios.post(
            `${apiBaseUrl || 'http://localhost:5000'}/api/ingest?mode=${mode}`,
            { mode }
        ));
    };

    useEffect(() => {
        socket.on('ingest-complete', (data) => {
            console.log('✅ Connected to socket:', socket.id);
            alert('🔥 ' + data.message);
        });

        return () => {
            socket.off('ingest-complete');
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <h1 className="text-3xl font-bold text-gray-900">Data Ingestion</h1>
                    <p className="mt-2 text-sm text-slate-600">Run ingestion with clean production-ready actions.</p>

                    <div className="mt-5 max-w-sm">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Mode</label>
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-500 transition focus:ring-2"
                        >
                            <option value="replace">Replace (clear + re-ingest)</option>
                            <option value="append">Append/Upsert</option>
                        </select>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <h2 className="text-lg font-semibold text-slate-900">Upload CSV</h2>
                        <p className="mt-1 text-sm text-slate-500">Choose a CSV file and run ingestion immediately.</p>

                        <input
                            type="file"
                            accept=".csv,text/csv"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="mt-4 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                        />

                        <button
                            disabled={loading}
                            onClick={handleUploadIngest}
                            className="mt-4 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Processing...' : 'Ingest Uploaded CSV'}
                        </button>
                    </section>

                    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <h2 className="text-lg font-semibold text-slate-900">Ingest from URL</h2>
                        <p className="mt-1 text-sm text-slate-500">Use a public/S3 CSV link for server-side ingestion.</p>

                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://.../sample-customers.csv"
                            className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-500 transition focus:ring-2"
                        />

                        <button
                            disabled={loading}
                            onClick={handleUrlIngest}
                            className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Processing...' : 'Ingest from URL'}
                        </button>
                    </section>
                </div>

                <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Run Server CSV (Legacy)</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Triggers backend legacy route <code className="rounded bg-slate-100 px-1 py-0.5">/api/ingest</code> using server-side CSV path.
                    </p>

                    <button
                        disabled={loading}
                        onClick={handleLegacyServerIngest}
                        className="mt-4 inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Processing...' : 'Run Server CSV (Legacy)'}
                    </button>
                </section>
            </main>
        </div>
    );
}
