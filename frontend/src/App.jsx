import { BrowserRouter, Routes, Route } from "react-router-dom";

import CreateTicket from "./pages/CreateTicket";
import MyTickets from "./pages/MyTickets";
import TechnicianTickets from "./pages/TechnicianTickets";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Navbar from "./components/NavBar";

function App() {
  return (
    <BrowserRouter>
    <Navbar />
    <div className="mt-2">   {/* Optional padding under navbar */}
      <Routes>
        <Route path="/" element={<CreateTicket />} />
        <Route path="/my" element={<MyTickets />} />
        <Route path="/tech" element={<TechnicianTickets />} />

        {/* 🔥 NEW DASHBOARDS */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />

        <Route path="/resources" element={<AdminDashboard />} />
      </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;