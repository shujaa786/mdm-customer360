'use client';
import { useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { apiClient } from '../lib/api/client';
import { endpoints } from '../lib/api/endpoints';
const CustomNode = ({ data }) => (
  <div
    className={`px-3 py-2 rounded-lg border-2 shadow-md transition-all min-w-[120px] text-center ${data.isGolden
      ? 'bg-amber-100 border-amber-500 font-semibold'
      : 'bg-blue-50 border-blue-300'
      }`}
    title={`${data.label}\nSystem: ${data.sourceSystem}`}
  >
    <Handle
      type="target"
      position={Position.Top}
    />
    <div className="text-xs font-medium text-slate-900">
      {data.label}
    </div>
    <div className="text-xs text-slate-600 mt-1">
      {data.sourceSystem}
    </div>
    <Handle
      type="source"
      position={Position.Bottom}
    />
  </div>
);
const nodeTypes = {
  custom: CustomNode
};
export default function RelationshipGraph() {
  const [rawNodes, setRawNodes] = useState([]);
  const [rawEdges, setRawEdges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] =
    useNodesState([]);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState([]);
  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);
      try {
        const data = await apiClient.get(
          endpoints.relationships.graph()
        );
        setRawNodes(data.nodes || []);
        setRawEdges(data.edges || []);
      } catch (err) {
        console.error(
          'Failed to fetch graph data:',
          err.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchGraphData();
  }, []);
  useEffect(() => {
    const reactFlowNodes = rawNodes.map(
      (node, index) => ({
        id: node.id,
        type: 'custom',
        data: {
          label: node.label,
          isGolden: node.isGolden,
          sourceSystem: node.sourceSystem
        },
        position: {
          x: 120 + (index % 8) * 220,
          y: 80 + Math.floor(index / 8) * 200
        },
        draggable: true
      })
    );
    setNodes(reactFlowNodes);
  }, [rawNodes, setNodes]);
  useEffect(() => {
    const reactFlowEdges = rawEdges.map(
      (edge) => {
        let strokeColor = '#6b7280';
        let strokeWidth = 2;
        if (edge.type === 'merged') {
          strokeColor = '#10b981';
          strokeWidth = 3;
        } else if (
          edge.type === 'potential'
        ) {
          strokeColor = '#f59e0b';
          strokeWidth = 2;
        }
        return {
          id: edge.id,
          source: edge.source.toString(),
          target: edge.target.toString(),
          label: `${edge.reason} (${edge.confidence}%)`,
          animated: edge.style === 'solid',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: strokeColor
          },
          style: {
            stroke: strokeColor,
            strokeWidth,
            strokeDasharray:
              edge.style === 'dashed'
                ? '5,5'
                : 'none'
          }
        };
      }
    );
    setEdges(reactFlowEdges);
  }, [rawEdges, setEdges]);
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {loading && (
        <div className="absolute top-4 left-4 z-10 bg-white px-4 py-2 rounded-lg shadow-lg text-sm text-slate-600">
          Loading relationship graph...
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background
          color="#e0e7ff"
          gap={16}
        />
        <Controls />
        <MiniMap
          nodeColor={(node) =>
            node.data.isGolden
              ? '#fbbf24'
              : '#93c5fd'
          }
          maskColor="rgba(0,0,0,0.1)"
        />
      </ReactFlow>
    </div>
  );
}