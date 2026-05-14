'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Toast from '../../../components/Toast';
import { apiClient } from '../../../lib/api/client';
import { endpoints } from '../../../lib/api/endpoints';
import ProtectedRoute from '../../../components/ProtectedRoute';
export default function Customer360Page() {
  const { id } = useParams();
  const [entity, setEntity] = useState(null);
  const [linkedRecords, setLinkedRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [relationships, setRelationships] = useState([]);
  const [toast, setToast] = useState({
    message: '',
    type: 'info'
  });
  useEffect(() => {
    const fetchCustomer360 = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await apiClient.get(
          endpoints.entities.byId(id)
        );
        setEntity(res.entity || null);
        setLinkedRecords(
          res.linkedRecords || []
        );
        setRelationships(
          res.relationships || []
        );
      } catch (err) {
        setToast({
          message:
            err.message ||
            'Unable to load Customer 360 profile.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer360();
  }, [id]);
  const goldenRecord = useMemo(() => {
    if (!entity) return null;
    if (entity.isGolden) return entity;
    return (
      linkedRecords.find(
        (record) =>
          record._id === entity.goldenId
      ) || null
    );
  }, [entity, linkedRecords]);
  const relationshipRows = useMemo(() => {
    const byId = new Map(
      linkedRecords.map((r) => [r._id, r])
    );
    return relationships.map((rel) => {
      const from = byId.get(rel.fromId);
      const to = byId.get(rel.toId);
      const fromLabel = from
        ? `${from.firstName || ''} ${from.lastName || ''}`.trim() || from.email
        : rel.fromId;
      const toLabel = to
        ? `${to.firstName || ''} ${to.lastName || ''}`.trim() || to.email
        : rel.toId;
      return {
        ...rel,
        fromLabel,
        toLabel
      };
    });
  }, [linkedRecords, relationships]);
  return (
    <ProtectedRoute
      allowedRoles={[
        'SUPER_ADMIN',
        'DATA_STEWARD',
        'BUSINESS_USER'
      ]}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
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
        <h1 className="text-3xl font-bold mb-6">
          Customer 360
        </h1>
        {loading && (
          <div className="space-y-4">
            <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        )}
        {!loading && entity && (
          <div className="space-y-6">
            {/* GOLDEN RECORD */}
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Golden Record
              </h2>
              {goldenRecord ? (
                <div className="grid gap-2 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold">
                      Name:
                    </span>{' '}
                    {goldenRecord.firstName}{' '}
                    {goldenRecord.lastName}
                  </p>
                  <p>
                    <span className="font-semibold">
                      Email:
                    </span>{' '}
                    {goldenRecord.email || 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold">
                      Phone:
                    </span>{' '}
                    {goldenRecord.phone || 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold">
                      Source System:
                    </span>{' '}
                    {goldenRecord.sourceSystem}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No golden record linked yet.
                </p>
              )}
            </section>
            {/* LINKED RECORDS */}
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Linked Records
              </h2>
              <div className="space-y-3">
                {linkedRecords.map((record) => (
                  <div
                    key={record._id}
                    className="rounded-xl border border-slate-200 p-3"
                  >
                    <p className="font-medium text-slate-900">
                      {record.firstName} {record.lastName}
                    </p>
                    <p className="text-sm text-slate-600">
                      {record.email || 'N/A'} • {record.phone || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Source: {record.sourceSystem}
                    </p>
                  </div>
                ))}
                {linkedRecords.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No linked records found.
                  </p>
                )}
              </div>
            </section>
            {/* RELATIONSHIPS */}
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Relationships
              </h2>
              {relationshipRows.length > 0 ? (
                <div className="space-y-2">
                  {relationshipRows.map((rel) => (
                    <div
                      key={rel._id}
                      className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700"
                    >
                      <p className="font-semibold text-slate-900">
                        {rel.type}
                      </p>
                      <p>
                        {rel.fromLabel} → {rel.toLabel}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No explicit relationships available for this customer.
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}