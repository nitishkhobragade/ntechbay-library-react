import React from 'react';
import { Navigate } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  onUnauthorized?: () => void;
}

/**
 * ProtectedRoute Wrapper
 * Listens directly to AuthContext authentication state.
 * Immediately redirects unauthenticated users or unauthorized non-admins to '/'
 * using { replace: true } with no cached private UI or flash of protected content.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
  onUnauthorized,
}) => {
  const { user, isAdmin, loading } = useAuth();

  React.useEffect(() => {
    if (!loading) {
      if (adminOnly && !isAdmin) {
        onUnauthorized?.();
      } else if (!adminOnly && !user) {
        onUnauthorized?.();
      }
    }
  }, [loading, user, isAdmin, adminOnly, onUnauthorized]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Verifying authorization & security permissions...</p>
        </div>
      </div>
    );
  }

  // Admin route requires role === 'admin' or master admin email
  if (adminOnly) {
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // General authenticated route requires active user
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
