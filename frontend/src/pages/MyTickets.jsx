import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

import AppLayout from "../components/AppLayout";
import TicketCard from "../components/TicketCard";
import { getUserTickets } from "../services/ticketService";
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
      const res = await getUserTickets(currentUserId);
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("Failed to load your tickets", "error");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (isLoaded && currentUserId) loadTickets();
  }, [isLoaded, currentUserId, loadTickets]);

  const filteredTickets = tickets.filter((ticket) => {
    const term = searchTerm.toLowerCase();
    return (
      ticket.title?.toLowerCase().includes(term) ||
      ticket.status?.toLowerCase().includes(term) ||
      ticket.category?.toLowerCase().includes(term) ||
      ticket.location?.toLowerCase().includes(term)
    );
  });

  if (!isLoaded) {
    return <div className="text-center py-20 text-gray-500">Loading user information...</div>;
  }

  return (
    <AppLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">My Tickets</h1>
            <p className="text-gray-500 mt-1 text-base">
              Track all incidents and maintenance requests you reported.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadTickets}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 disabled:opacity-70 transition-colors"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={() => navigate("/create")}
              className="flex items-center gap-2 bg-[#006591] hover:bg-[#006591]/90 text-white px-6 py-2.5 rounded-2xl font-medium transition-all active:scale-[0.985]"
            >
              <Plus size={20} /> New Ticket
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="relative max-w-lg">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, status, category, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#006591] focus:ring-1 focus:ring-[#006591]/20 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading your tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No tickets found</p>
            <button
              onClick={() => navigate("/create")}
              className="mt-4 text-[#006591] hover:underline font-medium"
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
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}