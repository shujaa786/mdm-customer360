'use client';
import { useEffect, useState } from 'react';
import socket from '../../lib/socket';
import Toast from '../../components/Toast';
import { apiClient } from '../../lib/api/client';
import { endpoints } from '../../lib/api/endpoints';
import ProtectedRoute from '../../components/ProtectedRoute';
export default function IngestPage() {
    const [file, setFile] = useState(null);
    const [mode, setMode] = useState('replace');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({
        message: '',
        type: 'info'
    });
    const runRequest = async (requestFn) => {
        try {
            setLoading(true);
            const res = await requestFn();
            setToast({
                message: res.message || 'Operation completed successfully.',
                type: 'success'
            });
        } catch (error) {
            setToast({
                message:
                    error.message ||
                    'Operation failed.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };
    const handleUploadIngest = async () => {
        if (!file) {
            setToast({
                message: 'Please select a CSV file first.',
                type: 'error'
            });
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mode', mode);
        await runRequest(() =>
            apiClient.postForm(
                endpoints.ingest.upload(mode),
                formData
            )
        );
    };
    const handleUrlIngest = async () => {
        if (!url.trim()) {
            setToast({
                message: 'Please enter a CSV URL.',
                type: 'error'
            });
            return;
        }
        await runRequest(() =>
            apiClient.post(
                endpoints.ingest.url(mode),
                {
                    csvUrl: url,
                    mode
                }
            )
        );
    };
    const handleLegacyServerIngest = async () => {
        await runRequest(() =>
            apiClient.post(
                endpoints.ingest.legacy(mode),
                { mode }
            )
        );
    };
    useEffect(() => {
        const handleIngestComplete = (data) => {
            console.log(
                '✅ Connected to socket:',
                socket.id
            );
            setToast({
                message: `🔥 ${data.message}`,
                type: 'success'
            });
        };
        socket.on(
            'ingest-complete',
            handleIngestComplete
        );
        return () => {
            socket.off(
                'ingest-complete',
                handleIngestComplete
            );
        };
    }, []);
    return (
        <ProtectedRoute
            allowedRoles={[
                'SUPER_ADMIN',
                'SOURCE_OPERATOR'
            ]}
        >
            <div className="min-h-screen bg-gray-50">
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
                    <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Data Ingestion
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Run ingestion with clean production-ready actions.
                        </p>
                        <div className="mt-5 max-w-sm">
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Mode
                            </label>
                            <select
                                value={mode}
                                onChange={(e) =>
                                    setMode(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-500 transition focus:ring-2"
                            >
                                <option value="replace">
                                    Replace (clear + re-ingest)
                                </option>
                                <option value="append">
                                    Append/Upsert
                                </option>
                            </select>
                        </div>
                    </div>
                    <div className="grid gap-6 xl:grid-cols-2">
                        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Upload CSV
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Choose a CSV file and run ingestion immediately.
                            </p>
                            <input
                                type="file"
                                accept=".csv,text/csv"
                                onChange={(e) =>
                                    setFile(
                                        e.target.files?.[0] || null
                                    )
                                }
                                className="mt-4 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                            />
                            <button
                                disabled={loading}
                                onClick={handleUploadIngest}
                                className="mt-4 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? 'Processing...'
                                    : 'Ingest Uploaded CSV'}
                            </button>
                        </section>
                        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Ingest from URL
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Use a public/S3 CSV link for server-side ingestion.
                            </p>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) =>
                                    setUrl(e.target.value)
                                }
                                placeholder="https://.../sample-customers.csv"
                                className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-500 transition focus:ring-2"
                            />
                            <button
                                disabled={loading}
                                onClick={handleUrlIngest}
                                className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? 'Processing...'
                                    : 'Ingest from URL'}
                            </button>
                        </section>
                    </div>
                    <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Run Server CSV (Legacy)
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Triggers backend legacy ingestion route.
                        </p>
                        <button
                            disabled={loading}
                            onClick={handleLegacyServerIngest}
                            className="mt-4 inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? 'Processing...'
                                : 'Run Server CSV (Legacy)'}
                        </button>
                    </section>
                </main>
            </div>
        </ProtectedRoute>
    );
}