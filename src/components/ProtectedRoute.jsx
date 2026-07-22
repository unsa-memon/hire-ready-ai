import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Target } from 'lucide-react';

export function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white animate-pulse">
            <Target size={24} className="animate-spin-slow" />
          </div>
          <p className="text-foreground/70 font-medium animate-pulse">Loading HireReady AI...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect them to the /login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
