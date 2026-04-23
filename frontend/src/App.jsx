import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignIn, SignUp } from "@clerk/clerk-react";

import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import CreateTicket from "./pages/CreateTicket";
import MyTickets from "./pages/MyTickets";
import TechnicianTickets from "./pages/TechnicianTickets";
import TicketDetail from "./pages/TicketDetail";
import NotificationsPage from "./pages/NotificationsPage";
import AdminPanel from "./pages/Admin";
import ResourcePage from "./pages/ResourcePage";
import MyBookings from "./pages/MyBookings";
import AdminBookingManagement from "./pages/AdminBookingManagement";
import QRCheckin from "./pages/QRCheckin";
import useCurrentUserRole from "./hooks/useCurrentUserRole";

function RoleBasedHomeRedirect() {
  const { role, loadingRole } = useCurrentUserRole();

  if (loadingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (role === "TECHNICIAN") {
    return <Navigate to="/technician" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <SignedOut>
                <SignIn routing="path" path="/login" signUpUrl="/signup" />
              </SignedOut>
              <SignedIn>
                <RoleBasedHomeRedirect />
              </SignedIn>
            </div>
          }
        />

        <Route
          path="/signup"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <SignedOut>
                <SignUp routing="path" path="/signup" signInUrl="/login" />
              </SignedOut>
              <SignedIn>
                <RoleBasedHomeRedirect />
              </SignedIn>
            </div>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["USER", "ADMIN", "TECHNICIAN"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resources"
          element={
            <ProtectedRoute allowedRoles={["USER", "ADMIN", "TECHNICIAN"]}>
              <ResourcePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute allowedRoles={["USER", "ADMIN", "TECHNICIAN"]}>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <CreateTicket />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute allowedRoles={["USER", "ADMIN", "TECHNICIAN"]}>
              <MyTickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute allowedRoles={["USER", "ADMIN", "TECHNICIAN"]}>
              <TicketDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/technician"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN", "ADMIN"]}>
              <TechnicianTickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["USER", "ADMIN", "TECHNICIAN"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminBookingManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/qr-checkin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <QRCheckin />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<RoleBasedHomeRedirect />} />
        <Route path="*" element={<RoleBasedHomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;