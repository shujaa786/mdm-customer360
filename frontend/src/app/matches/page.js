'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../../lib/env';

const apiBaseUrl = getApiBaseUrl();

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);

  const fetchMatches = async () => {
    const res = await axios.post(`${apiBaseUrl || 'http://localhost:5000'}/api/match`);
    setMatches(res.data.matches || []);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Potential Matches</h1>

      <div className="space-y-4">
        {matches.map((m, i) => (
          <div key={i} className="p-4 bg-white shadow rounded-xl">
            <p>Entity 1: {m.entity1}</p>
            <p>Entity 2: {m.entity2}</p>
            <p>Score: {m.score}</p>
            <p className="text-sm text-gray-500">{m.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}