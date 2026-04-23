import { useUser } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";
import useCurrentUserRole from "../hooks/useCurrentUserRole";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();
  const { role, loadingRole } = useCurrentUserRole();

  if (!isLoaded || loadingRole) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading permissions...
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}