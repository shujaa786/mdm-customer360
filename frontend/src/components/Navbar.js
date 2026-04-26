import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="p-4 bg-white shadow flex gap-6">
      <Link href="/">Dashboard</Link>
      <Link href="/ingest">Ingest</Link>
      <Link href="/matches">Matches</Link>
      <Link href="/graph">Graph</Link>
    </div>
  );
}