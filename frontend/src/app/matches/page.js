'use client';
import { useEffect, useState } from 'react';
import Toast from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api/client';
import { endpoints } from '../../lib/api/endpoints';
import ProtectedRoute from '../../components/ProtectedRoute';
export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingKey, setActionLoadingKey] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post(
        endpoints.match.match()
      );
      setMatches(res.matches || []);
    } finally {
      setLoading(false);
    }
  };
  const getName = (entity) => `${entity?.firstName || ''} ${entity?.lastName || ''}`.trim() || 'Unknown';
  const getEntityId = (entity) => {
    if (!entity) return '';
    if (typeof entity === 'string') return entity;
    return entity._id || entity.id || '';
  };
  const getEntityEmail = (entity) => {
    if (!entity || typeof entity === 'string') return '';
    return entity.email || '';
  };
  const handleMerge = async (match) => {
    const entity1Id = getEntityId(match.entity1);
    const entity2Id = getEntityId(match.entity2);
    const key = `${entity1Id || 'e1'}-${entity2Id || 'e2'}-${match.score || 0}-${match.reason || ''}`;
    if (!entity1Id || !entity2Id) {
      setToast({
        message: err.message,
        type: 'error'
      });
      return;
    }
    setActionLoadingKey(key);
    try {
      await apiClient.post(
        endpoints.match.merge(),
        {
          entity1Id,
          entity2Id
        }
      );
      setMatches((prev) =>
        prev.filter(
          (m) =>
            !(
              getEntityId(m.entity1) === entity1Id &&
              getEntityId(m.entity2) === entity2Id
            )
        )
      );
      setToast({
        message: 'Merge completed and golden record updated.',
        type: 'success'
      });
    } catch (err) {
      setToast({
        message: err.message || 'Merge failed. Please try again.',
        type: 'error'
      });
    } finally {
      setActionLoadingKey(null);
    }
  };
  const handleReject = (match) => {
    const entity1Id = getEntityId(match.entity1);
    const entity2Id = getEntityId(match.entity2);
    setMatches((prev) => prev.filter((m) => !(getEntityId(m.entity1) === entity1Id && getEntityId(m.entity2) === entity2Id)));
    setToast({ message: 'Match rejected from current review queue.', type: 'info' });
  };
  useEffect(() => {
    fetchMatches();
  }, []);
  return (
    <ProtectedRoute
      allowedRoles={[
        'SUPER_ADMIN',
        'DATA_STEWARD'
      ]}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
        <h1 className="text-3xl font-bold mb-6">Potential Matches</h1>
        <div className="space-y-4">
          {loading && <p className="text-sm text-slate-500">Loading matches...</p>}
          {!loading && matches.length === 0 && <p className="text-sm text-slate-500">No potential matches.</p>}
          {matches.map((m) => {
            const entity1Id = getEntityId(m.entity1);
            const entity2Id = getEntityId(m.entity2);
            const cardKey = `${entity1Id || 'e1'}-${entity2Id || 'e2'}-${m.score || 0}-${m.reason || ''}`;
            const isActionLoading = actionLoadingKey === cardKey;
            const name1 = getName(m.entity1);
            const name2 = getName(m.entity2);
            const email = getEntityEmail(m.entity1) || getEntityEmail(m.entity2) || 'N/A';
            return (
              <div key={cardKey} className="p-5 bg-white shadow rounded-xl ring-1 ring-slate-200">
                <p className="text-lg font-semibold text-slate-900">{name1} ↔ {name2}</p>
                <p className="text-sm text-slate-700 mt-1">Email: {email}</p>
                <p className="text-sm font-medium text-slate-900 mt-1">Score: {m.score}</p>
                <p className="text-sm text-gray-500 mt-1">{m.reason}</p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleMerge(m)}
                    disabled={isActionLoading || !entity1Id || !entity2Id}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isActionLoading ? 'Merging...' : 'Merge'}
                  </button>
                  <button
                    onClick={() => handleReject(m)}
                    disabled={isActionLoading}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reject
                  </button>            
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ProtectedRoute>
  );
}