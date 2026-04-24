import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

import AppLayout from "../components/AppLayout";
import TicketCard from "../components/TicketCard";
import { getTechnicianTickets } from "../services/ticketService";
import Toast from "../components/Toast";

export default function TechnicianTickets() {
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

  const loadTickets = async () => {
    if (!isLoaded || !currentUserId) return;

    setLoading(true);
    try {
      const res = await getTechnicianTickets(currentUserId);
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("Failed to load assigned tickets", "error");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && currentUserId) loadTickets();
  }, [isLoaded, currentUserId]);

  const filteredTickets = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return tickets.filter(
      (ticket) =>
        ticket.title?.toLowerCase().includes(term) ||
        ticket.status?.toLowerCase().includes(term) ||
        ticket.category?.toLowerCase().includes(term) ||
        ticket.location?.toLowerCase().includes(term)
    );
  }, [tickets, searchTerm]);

  const stats = useMemo(() => {
    return {
      open: tickets.filter((t) => t.status === "OPEN").length,
      inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    };
  }, [tickets]);

  if (!isLoaded) return <div className="text-center py-20">Loading...</div>;

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
        <div className="bg-gradient-to-r from-[#006591] via-[#006591] to-[#e31836] rounded-2xl p-8 text-white">
          <h1 className="text-2xl font-semibold">
            Welcome back! {/*{user?.firstName || user?.fullName || "Technician"}*/}
          </h1>
          <p className="mt-2 text-white/90">
            View assigned tickets, start work, and resolve incidents with clear resolution notes.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
              Assigned Tickets
              <Wrench className="text-amber-500" size={30} />
            </h1>
            <p className="text-zinc-500 mt-2">
              You can start assigned work and resolve tickets with resolution notes.
            </p>
          </div>

          <button
            onClick={loadTickets}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 disabled:opacity-70"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Stat label="Open" value={loading ? "..." : stats.open} />
          <Stat label="In Progress" value={loading ? "..." : stats.inProgress} />
          <Stat label="Resolved" value={loading ? "..." : stats.resolved} />
        </div>

        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-5">
          <div className="relative max-w-lg">
            <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assigned tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 border border-zinc-200 rounded-2xl focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-500">
            Loading assigned tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-300">
            <p className="text-zinc-500">No tickets assigned to you yet</p>
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

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-3xl font-bold text-zinc-900 mt-1">{value}</p>
    </div>
  );
}