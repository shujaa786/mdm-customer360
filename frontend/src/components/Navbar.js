'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
export default function Navbar() {
  const { logout, user } = useAuth();
  return (
    <div className="p-4 bg-white shadow flex items-center justify-between">
      <div className="flex gap-6">
        {
          (
            user?.role === 'SUPER_ADMIN' ||
            user?.role === 'DATA_STEWARD'
          ) && (
            <Link href="/">
              Dashboard
            </Link>
          )
        }
        {
          (
            user?.role === 'SUPER_ADMIN' ||
            user?.role === 'DATA_STEWARD'
          ) && (
            <Link href="/graph">
              Graph
            </Link>
          )
        }
        {
          (
            user?.role === 'SUPER_ADMIN' ||
            user?.role === 'DATA_STEWARD' ||
            user?.role === 'BUSINESS_USER'
          ) && (
            <Link href="/customer-search">
              Customer 360
            </Link>
          )
        }
        {/* ROLE-BASED LINKS */}
        {(user?.role === 'SUPER_ADMIN' ||
          user?.role === 'SOURCE_OPERATOR') && (
            <Link href="/ingest">
              Ingest
            </Link>
          )}
        {(user?.role === 'SUPER_ADMIN' ||
          user?.role === 'DATA_STEWARD') && (
            <Link href="/matches">
              Matches
            </Link>
          )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {user?.role}
        </span>
        <button
          onClick={logout}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}