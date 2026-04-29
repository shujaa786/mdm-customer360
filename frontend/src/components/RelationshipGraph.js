'use client';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import { getApiBaseUrl } from '../lib/env';

const apiBaseUrl = getApiBaseUrl() || 'http://localhost:5000';

export default function RelationshipGraph() {
  const [entities, setEntities] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);
      try {
        const [entitiesRes, relRes] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/entities?limit=200`),
          axios.get(`${apiBaseUrl}/api/relationships`)
        ]);

        setEntities(entitiesRes.data.entities || []);
        setRelationships(relRes.data.relationships || []);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  const nodes = useMemo(() => {
    return entities.map((entity, index) => ({
      id: String(entity._id),
      data: { label: `${entity.firstName || ''} ${entity.lastName || ''}`.trim() || entity.email || 'Unknown' },
      position: {
        x: 120 + (index % 5) * 220,
        y: 80 + Math.floor(index / 5) * 140
      }
    }));
  }, [entities]);

  const edges = useMemo(() => {
    const nodeIds = new Set(nodes.map((n) => n.id));

    return relationships
      .map((rel) => ({
        id: String(rel._id),
        source: String(rel.fromId),
        target: String(rel.toId),
        label: rel.type
      }))
      .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  }, [relationships, nodes]);

  return (
    <div style={{ height: 500 }}>
      {loading && <div className="mb-2 text-sm text-slate-500">Loading relationship graph...</div>}
      <ReactFlow nodes={nodes} edges={edges} />
    </div>
  );
}