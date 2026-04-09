// frontend/components/Navbar.js
'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
          <Link href="/" className="text-2xl font-bold text-blue-600">MDM360</Link>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Dashboard</Link>
            <Link href="/ingest" className="hover:text-blue-600">Ingest Data</Link>
            <Link href="/matches" className="hover:text-blue-600">Matches</Link>
            <Link href="/graph" className="hover:text-blue-600">Relationship Graph</Link>
          </div>
        </div>
        <div className="text-sm text-gray-500">Reltio-Inspired Demo</div>
      </div>
    </nav>
  );
}