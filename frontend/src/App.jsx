import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateTicket from "./pages/CreateTicket";
import MyTickets from "./pages/MyTickets";
import TechnicianTickets from "./pages/TechnicianTickets";
import TicketDetail from "./pages/TicketDetail";
import AdminPanel from "./pages/Admin";
import NotificationsPage from "./pages/NotificationsPage";

import AdminDashboard from "./pages/AdminDashboard";
import AdminBookingManagement from "./pages/AdminBookingManagement";
import UserDashboard from "./pages/UserDashboard";
import ResourceBookingPage from "./pages/ResourceBookingPage";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Clerk Auth */}
        <Route path="/login/*" element={<Login />} />
        <Route path="/signup/*" element={<Signup />} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Shared dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["USER", "TECHNICIAN", "ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Ticket module - user */}
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

        {/* Ticket module - technician */}
        <Route
          path="/technician"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
              <TechnicianTickets />
            </ProtectedRoute>
          }
        />

        {/* Ticket details / notifications */}
        <Route
          path="/ticket/:id"
          element={
            <ProtectedRoute allowedRoles={["USER", "TECHNICIAN", "ADMIN"]}>
              <TicketDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["USER", "TECHNICIAN", "ADMIN"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Booking / resource pages */}
        <Route
          path="/resources"
          element={
            <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
              <ResourceBookingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin pages */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;