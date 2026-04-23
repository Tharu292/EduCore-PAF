import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import Toast from "../components/Toast";

import { getTicketById, updateStatus, removeAttachment } from "../services/ticketService";
import StatusBadge from "../components/StatusBadge";
import CommentSection from "../components/CommentSection";
import UploadImages from "../components/UploadImages";
import AppLayout from "../components/AppLayout";
import useCurrentUserRole from "../hooks/useCurrentUserRole";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { role } = useCurrentUserRole();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const currentUserId = user?.id;
  const isCreator = currentUserId === ticket?.createdBy;
  const isAssigned = currentUserId === ticket?.assignedTo;
  const isAdmin = role === "ADMIN";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadTicket = async () => {
    try {
      const res = await getTicketById(id);
      setTicket(res.data);
    } catch (err) {
      showToast("Ticket not found", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadTicket();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!isAssigned && !isCreator && !isAdmin) return;
    if (!confirm(`Change status to ${newStatus}?`)) return;

    try {
      await updateStatus(id, newStatus);
      showToast(`Status updated to ${newStatus}`, "success");
      loadTicket();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update status", "error");
    }
  };

  const handleRemoveImage = async (filename) => {
    if (!confirm("Remove this image?")) return;
    try {
      await removeAttachment(id, filename);
      showToast("Image removed successfully", "success");
      loadTicket();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to remove image", "error");
    }
  };

  if (loading) return <div className="text-center py-20">Loading ticket...</div>;
  if (!ticket) return <div className="text-center py-20">Ticket not found</div>;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold">{ticket.title}</h1>
              <p className="text-gray-500">Ticket ID: {ticket.id}</p>
            </div>
            <StatusBadge status={ticket.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="font-semibold text-lg mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 text-sm">
                <div><span className="text-gray-500">Location:</span> {ticket.location || "—"}</div>
                <div><span className="text-gray-500">Priority:</span> {ticket.priority}</div>
                <div><span className="text-gray-500">Created By:</span> {ticket.createdBy}</div>
                <div><span className="text-gray-500">Assigned To:</span> {ticket.assignedTo || "Not Assigned"}</div>
              </div>

              {ticket.attachments?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Attachments ({ticket.attachments.length}/3)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ticket.attachments.map((filename, i) => (
                      <div key={i} className="relative group border rounded-2xl overflow-hidden">
                        <img
                          src={`http://localhost:8080/uploads/${filename}`}
                          alt="attachment"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/300x200?text=Image+Error";
                          }}
                        />
                        {(isCreator || isAssigned || isAdmin) && (
                          <button
                            onClick={() => handleRemoveImage(filename)}
                            className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 h-fit">
              <h3 className="font-semibold mb-4">Ticket Actions</h3>

              {(isAssigned || isCreator || isAdmin) &&
                ticket.status !== "CLOSED" &&
                ticket.status !== "REJECTED" && (
                  <div className="space-y-3">
                    {ticket.status === "OPEN" && (
                      <button
                        onClick={() => handleStatusChange("IN_PROGRESS")}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl"
                      >
                        Start Work
                      </button>
                    )}

                    {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
                      <button
                        onClick={() => handleStatusChange("RESOLVED")}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
                      >
                        Mark as Resolved
                      </button>
                    )}

                    {ticket.status === "RESOLVED" && (
                      <button
                        onClick={() => handleStatusChange("CLOSED")}
                        className="w-full bg-gray-800 hover:bg-black text-white py-3 rounded-xl"
                      >
                        Close Ticket
                      </button>
                    )}
                  </div>
                )}

              {(isCreator || isAssigned || isAdmin) && (
                <div className="mt-6">
                  <UploadImages ticketId={id} onUploadSuccess={loadTicket} showToast={showToast} />
                </div>
              )}
            </div>
          </div>

          <CommentSection
            ticket={ticket}
            currentUserId={currentUserId}
            onUpdate={loadTicket}
            showToast={showToast}
          />
        </div>
      </div>
    </AppLayout>
  );
}