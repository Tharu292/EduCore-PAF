import { BrowserRouter, Routes, Route , Navigate} from "react-router-dom";

import CreateTicket from "./pages/CreateTicket";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./routes/ProtectedRoute";
import MyTickets from "./pages/MyTickets";
import TechnicianTickets from "./pages/TechnicianTickets";
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        
        <Route path="/signup/*" element={<Signup />} />
        <Route path="/login/*" element={<Login />} />
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
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="/notifications" element={
           <ProtectedRoute>
              <NotificationsPage />
           </ProtectedRoute>
          } 
          />
        
        <Route path="/create" element={<CreateTicket />} />
        <Route path="/my" element={<MyTickets />} />
        <Route path="/tech" element={<TechnicianTickets />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;