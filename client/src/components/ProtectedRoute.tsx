// ProtectedRoute.tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // import your AuthContext

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isLoggedIn } = useContext(AuthContext); 

    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    if (React.isValidElement(children)) {
      return children;
    }
    
    return null;
};