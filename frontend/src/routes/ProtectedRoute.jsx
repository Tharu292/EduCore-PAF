import { useUser } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";


export default function ProtectedRoute({ children, allowedRole }) {
  
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  
  if (!isSignedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  
  if (allowedRole && user.publicMetadata?.role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  
  return children;
}