import { BrowserRouter, Routes, Route } from "react-router-dom";

import CreateTicket from "./pages/CreateTicket";
import MyTickets from "./pages/MyTickets";
import TechnicianTickets from "./pages/TechnicianTickets";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResourceBookingPage from "./pages/ResourceBookingPage";
import Navbar from "./components/NavBar";

function App() {
  return (
    <BrowserRouter>
    <Navbar />
    <div className="mt-2">   {/* Optional padding under navbar */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/tickets/create" element={<CreateTicket />} />
        <Route path="/my" element={<MyTickets />} />
        <Route path="/tech" element={<TechnicianTickets />} />

        {/* 🔥 NEW DASHBOARDS */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />

        <Route path="/resources" element={<ResourceBookingPage />} />
      </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
