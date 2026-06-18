import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'Admin' | 'Interior Designer' | 'Project Manager' | 'Vendor Coordinator' | 'Client'>;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser } = useAppStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // If the user's role is not allowed, redirect back to the default landing (dashboard)
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
