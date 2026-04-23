import { useEffect, useState } from "react";
import TicketCard from "../components/TicketCard";
import { getMyTickets, getAllTickets } from "../services/ticketService";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [myTickets, setMyTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMyTickets("user1").then((res) => setMyTickets(res.data));
    getAllTickets().then((res) => setAllTickets(res.data));
  }, []);

  return (
    <div>
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">Welcome back, Tharushi 👋</h2>
        <p className="text-gray-600">Here's what's happening with your support tickets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* My Recent Tickets */}
        <div>
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">My Recent Tickets</h3>
          <div className="space-y-6">
            {myTickets.slice(0, 4).map((t) => (
              <TicketCard key={t.id} ticket={t} onClick={() => navigate(`/ticket/${t.id}`)} />
            ))}
          </div>
        </div>

        {/* All Open Tickets */}
        <div>
          <h3 className="font-semibold text-lg mb-6">All Open Tickets</h3>
          <div className="space-y-6">
            {allTickets
              .filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS")
              .slice(0, 4)
              .map((t) => (
                <TicketCard key={t.id} ticket={t} onClick={() => navigate(`/ticket/${t.id}`)} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}