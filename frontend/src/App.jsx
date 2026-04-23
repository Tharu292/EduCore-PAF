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

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login/*" element={<Login />} />
        <Route path="/signup/*" element={<Signup />} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
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
            <ProtectedRoute allowedRoles={["USER", "TECHNICIAN", "ADMIN"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ticket/:id"
          element={
            <ProtectedRoute allowedRoles={["USER", "TECHNICIAN", "ADMIN"]}>
              <TicketDetail />
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

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;