import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Wrench, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

import AppLayout from "../components/AppLayout";
import TicketCard from "../components/TicketCard";
import { getTechnicianTickets, updateStatus } from "../services/ticketService";
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
      console.error("Failed to load technician tickets:", err);
      showToast("Failed to load assigned tickets", "error");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && currentUserId) {
      loadTickets();
    }
  }, [isLoaded, currentUserId]);

  const handleMarkResolved = async (id) => {
    if (!window.confirm("Mark this ticket as RESOLVED?")) return;

    const resolutionNotes =
      window.prompt("Add resolution notes (optional):") || "";

    try {
      await updateStatus(id, "RESOLVED", "", resolutionNotes);
      showToast("Ticket marked as resolved", "success");
      loadTickets();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update status", "error");
    }
  };

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
    const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;
    const resolved = tickets.filter((t) => t.status === "RESOLVED").length;
    const open = tickets.filter((t) => t.status === "OPEN").length;

    return { open, inProgress, resolved };
  }, [tickets]);

  if (!isLoaded) {
    return <div className="text-center py-20">Loading...</div>;
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
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 flex items-center gap-3">
              Technician Tickets
              <Wrench className="text-amber-500" size={30} />
            </h1>
            <p className="text-zinc-500 mt-2">
              View and resolve tickets assigned to you.
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
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
            <p className="text-sm text-zinc-500">Open</p>
            <p className="text-3xl font-bold text-zinc-900 mt-1">
              {loading ? "..." : stats.open}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
            <p className="text-sm text-zinc-500">In Progress</p>
            <p className="text-3xl font-bold text-zinc-900 mt-1">
              {loading ? "..." : stats.inProgress}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
            <p className="text-sm text-zinc-500">Resolved</p>
            <p className="text-3xl font-bold text-zinc-900 mt-1">
              {loading ? "..." : stats.resolved}
            </p>
          </div>
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
              <div key={ticket.id} className="relative">
                <TicketCard
                  ticket={ticket}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                />

                {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkResolved(ticket.id);
                    }}
                    className="absolute bottom-6 right-6 inline-flex items-center gap-2 bg-green-600 text-white text-sm px-5 py-2.5 rounded-2xl hover:bg-green-700 transition shadow"
                  >
                    <CheckCircle2 size={16} />
                    Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}