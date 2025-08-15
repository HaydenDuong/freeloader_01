import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    // Redirect authenticated users to their appropriate dashboard
    if (user.role === 'organizer') {
      return <Navigate to="/organizer" replace />;
    } else if (user.role === 'student') {
      return <Navigate to="/student" replace />;
    }
  }

  return <>{children}</>;
};

export default PublicRoute;
