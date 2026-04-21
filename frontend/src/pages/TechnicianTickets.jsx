import { useEffect, useState } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TicketCard from "../components/TicketCard";
import { getTechnicianTickets, updateStatus } from "../services/ticketService";

export default function TechnicianTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await getTechnicianTickets("tech1"); // Change "tech1" to dynamic technician name later
      setTickets(res.data || []);
    } catch (err) {
      console.error("Failed to load technician tickets:", err);
      // If no tickets assigned, show empty state instead of alert
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleMarkResolved = async (id) => {
    if (!confirm("Mark this ticket as RESOLVED?")) return;

    try {
      await updateStatus(id, "RESOLVED");
      alert("Ticket marked as Resolved");
      loadTickets(); // refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
            Assigned Tickets
            <AlertTriangle className="text-amber-500" size={28} />
          </h1>
          <p className="text-gray-600 mt-1">Tickets assigned to you for resolution</p>
        </div>

        <button
          onClick={loadTickets}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 transition disabled:opacity-70"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search assigned tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading assigned tickets...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <p className="text-gray-500">No tickets assigned to you yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="relative">
              <TicketCard
                ticket={ticket}
                onClick={() => navigate(`/ticket/${ticket.id}`)}
              />

              {/* Technician quick action - only show if not resolved/closed */}
              {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkResolved(ticket.id);
                  }}
                  className="absolute bottom-6 right-6 bg-green-600 text-white text-sm px-5 py-2 rounded-2xl hover:bg-green-700 transition shadow"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}