'use client';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';

export default function RelationshipGraph() {
  const nodes = [
    { id: '1', data: { label: 'John Doe' }, position: { x: 100, y: 100 } },
    { id: '2', data: { label: 'Jane Smith' }, position: { x: 300, y: 200 } }
  ];

  const edges = [
    { id: 'e1-2', source: '1', target: '2', label: 'Household' }
  ];

  return (
    <div style={{ height: 500 }}>
      <ReactFlow nodes={nodes} edges={edges} />
    </div>
  );
}