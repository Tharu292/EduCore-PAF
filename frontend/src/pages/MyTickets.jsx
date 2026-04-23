import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

import AppLayout from "../components/AppLayout";
import TicketCard from "../components/TicketCard";
import { getMyTickets } from "../services/ticketService";
import Toast from "../components/Toast";

export default function MyTickets() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  const currentUserId = user?.id;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadTickets = useCallback(async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      const res = await getMyTickets(currentUserId);
      setTickets(res.data || []);
    } catch (err) {
      console.error("Failed to load tickets:", err);
      showToast("Failed to load your tickets", "error");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (isLoaded && currentUserId) {
      loadTickets();
    }
  }, [isLoaded, currentUserId, loadTickets]);

  const filteredTickets = tickets.filter((ticket) =>
    ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoaded) {
    return <div className="text-center py-20">Loading user information...</div>;
  }

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">My Tickets</h1>
          <p className="text-gray-600 mt-1">Track all your reported incidents</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={loadTickets}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 disabled:opacity-70"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={() => navigate("/create")}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl hover:bg-blue-700"
          >
            <Plus size={20} /> New Ticket
          </button>
        </div>
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by title or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading your tickets...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <p className="text-gray-500">No tickets found</p>
          <button
            onClick={() => navigate("/create")}
            className="mt-4 text-blue-600 hover:underline"
          >
            Create your first ticket →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => navigate(`/ticket/${ticket.id}`)}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}