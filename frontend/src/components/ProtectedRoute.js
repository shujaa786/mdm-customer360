'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
export default function ProtectedRoute({
  children,
  allowedRoles = []
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (
      user &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role)
    ) {
      router.push('/unauthorized');
    }
  }, [user, loading, allowedRoles, router]);
  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );
  }
  if (!user) {
    return null;
  }
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return null;
  }
  return children;
}