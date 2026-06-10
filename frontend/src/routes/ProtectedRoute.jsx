import { Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import useCurrentUserRole from "../hooks/useCurrentUserRole";

function getHomePath(role) {
  if (role === "ADMIN") return "/admin";
  if (role === "TECHNICIAN") return "/technician";
  return "/dashboard";
}

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { role, loadingRole } = useCurrentUserRole();

  return (
    <>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>

      <SignedIn>
        {loadingRole ? (
          <div className="min-h-screen flex items-center justify-center text-gray-500">
            Loading permissions...
          </div>
        ) : allowedRoles.length > 0 && !allowedRoles.includes(role) ? (
          <Navigate to={getHomePath(role)} replace />
        ) : (
          children
        )}
      </SignedIn>
    </>
  );
}