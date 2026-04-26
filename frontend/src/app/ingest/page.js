'use client';
import axios from 'axios';
import socket from '../../lib/socket';
import { useEffect } from 'react';
import { getApiBaseUrl } from '../../lib/env';

const apiBaseUrl = getApiBaseUrl();

export default function IngestPage() {

    const handleIngest = async () => {
        await axios.post(`${apiBaseUrl || 'http://localhost:5000'}/api/ingest`);
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
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold mb-6">Data Ingestion</h1>

            <button
                onClick={handleIngest}
                className="px-20 py-5 bg-green-800 text-white rounded-xl"
            >
                Run Ingestion
            </button>
        </div>
    );
}
