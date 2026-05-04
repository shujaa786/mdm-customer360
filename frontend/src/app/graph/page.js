import RelationshipGraph from '../../components/RelationshipGraph';

export default function GraphPage() {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Relationship Graph</h1>
        <p className="text-sm text-slate-500 mt-1">Visualize entity relationships and golden records</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <RelationshipGraph />
      </div>
    </div>
  );
}