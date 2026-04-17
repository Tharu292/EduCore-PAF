import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateTicket from "./pages/CreateTicket";
import MyTickets from "./pages/MyTickets";
import TechnicianTickets from "./pages/TechnicianTickets";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateTicket />} />
        <Route path="/my" element={<MyTickets />} />
        <Route path="/tech" element={<TechnicianTickets />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;