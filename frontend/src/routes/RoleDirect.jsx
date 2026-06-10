import { Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import useCurrentUserRole from "../hooks/useCurrentUserRole";

export default function RoleRedirect() {
  const { role, loadingRole } = useCurrentUserRole();

  return (
    <>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>

      <SignedIn>
        {loadingRole ? (
          <div className="min-h-screen flex items-center justify-center text-gray-500">
            Loading dashboard...
          </div>
        ) : role === "ADMIN" ? (
          <Navigate to="/admin" replace />
        ) : role === "TECHNICIAN" ? (
          <Navigate to="/technician" replace />
        ) : (
          <Navigate to="/dashboard" replace />
        )}
      </SignedIn>
    </>
  );
}