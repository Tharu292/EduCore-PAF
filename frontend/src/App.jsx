import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignIn, SignUp } from "@clerk/clerk-react";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRedirect from "./routes/RoleDirect";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login/*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <SignedOut>
                <SignIn
                  routing="path"
                  path="/login"
                  signUpUrl="/signup"
                  forceRedirectUrl="/"
                />
              </SignedOut>

              <SignedIn>
                <RoleRedirect />
              </SignedIn>
            </div>
          }
        />

        <Route
          path="/signup/*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <SignedOut>
                <SignUp
                  routing="path"
                  path="/signup"
                  signInUrl="/login"
                  forceRedirectUrl="/"
                />
              </SignedOut>

              <SignedIn>
                <RoleRedirect />
              </SignedIn>
            </div>
          }
        />

        <Route path="/" element={<RoleRedirect />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
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
            <ProtectedRoute allowedRoles={["USER"]}>
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
            <ProtectedRoute allowedRoles={["USER"]}>
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
            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
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

        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;