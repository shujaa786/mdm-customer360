import RelationshipGraph from '../../components/RelationshipGraph';

export default function GraphPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Relationship Graph</h1>
      <RelationshipGraph />
    </div>
  );
}