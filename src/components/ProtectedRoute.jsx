import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(null);
  const [userRole, setUserRole] = React.useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.checkAuth();
      const role = authService.getUserRole();
      
      setIsAuthenticated(isAuth);
      setUserRole(role);
    };

    checkAuth();
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">लॉड हो रहा है...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Wrong role
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to correct dashboard based on user role
    if (userRole === 'operator') {
      return <Navigate to="/operator" replace />;
    } else if (userRole === 'gp') {
      return <Navigate to="/gp" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;