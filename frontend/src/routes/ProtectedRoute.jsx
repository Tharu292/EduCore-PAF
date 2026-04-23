import { Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import useCurrentUserRole from "../hooks/useCurrentUserRole";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { role, loadingRole } = useCurrentUserRole();

  const getHomeRouteByRole = () => {
    if (role === "ADMIN") return "/admin";
    if (role === "TECHNICIAN") return "/technician";
    return "/dashboard";
  };

  return (
    <>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>

      <SignedIn>
        {loadingRole ? (
          <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
            Loading...
          </div>
        ) : allowedRoles.length > 0 && !allowedRoles.includes(role) ? (
          <Navigate to={getHomeRouteByRole()} replace />
        ) : (
          children
        )}
      </SignedIn>
    </>
  );
}