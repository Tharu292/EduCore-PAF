import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import API from "../api/axios";

import { getTicketById, updateStatus } from "../services/ticketService";
import StatusBadge from "../components/StatusBadge";
import CommentSection from "../components/CommentSection";
import UploadImages from "../components/UploadImages";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const currentUser = "user1";

  const isTechnician =
    currentUser === ticket?.assignedTo || currentUser === "tech1";
  const isCreator = currentUser === ticket?.createdBy;

  const loadTicket = async () => {
    try {
      const res = await getTicketById(id);
      setTicket(res.data);
    } catch (err) {
      console.error(err);
      alert("Ticket not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!isTechnician) return;
    if (!confirm(`Change status to ${newStatus}?`)) return;

    setUpdating(true);
    try {
      await updateStatus(id, newStatus);
      alert(`Ticket updated to ${newStatus}`);
      loadTicket();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleUploadSuccess = () => {
    loadTicket();
  };

  const handleRemoveImage = async (filename) => {
    if (!confirm("Remove this image?")) return;

    try {
      await API.delete(`/tickets/${ticket.id}/attachments/${filename}`, {
        params: { user: currentUser },
      });
      alert("Image removed successfully");
      loadTicket();
    } catch (err) {
      console.error(err);
      alert("Failed to remove image");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading ticket details...
      </div>
    );
  }

  if (!ticket) {
    return <div className="text-center py-20">Ticket not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="bg-white rounded-3xl shadow p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {ticket.title}
            </h1>
            <p className="text-gray-500 mt-1">
              Ticket ID: {ticket.id}
            </p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* LEFT SIDE */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-gray-500">Category:</span>{" "}
                <span className="font-medium">{ticket.category}</span>
              </div>
              <div>
                <span className="text-gray-500">Priority:</span>{" "}
                <span className="font-medium">{ticket.priority}</span>
              </div>
              <div>
                <span className="text-gray-500">Created By:</span>{" "}
                <span className="font-medium">{ticket.createdBy}</span>
              </div>
              <div>
                <span className="text-gray-500">Assigned To:</span>{" "}
                <span className="font-medium">
                  {ticket.assignedTo || "Not Assigned"}
                </span>
              </div>
            </div>

            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  📎 Attachments ({ticket.attachments.length}/3)
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {ticket.attachments.map((filename, index) => (
                    <div
                      key={index}
                      className="group relative border rounded-2xl overflow-hidden bg-gray-50"
                    >
                      <img
                        src={`http://localhost:8080/uploads/${filename}`}
                        alt=""
                        className="w-full h-56 object-cover group-hover:scale-105 transition"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/600x400";
                        }}
                      />

                      <button
                        onClick={() => handleRemoveImage(filename)}
                        className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="bg-gray-50 rounded-2xl p-6 h-fit">
            <h3 className="font-semibold mb-4">Ticket Actions</h3>

            {/* Status Update */}
            {isTechnician &&
              ticket.status !== "CLOSED" &&
              ticket.status !== "REJECTED" && (
                <div className="space-y-3 mb-6">
                  {ticket.status === "OPEN" && (
                    <button
                      onClick={() =>
                        handleStatusChange("IN_PROGRESS")
                      }
                      className="bg-yellow-500 text-white w-full py-2 rounded-xl"
                    >
                      Start Work
                    </button>
                  )}

                  {(ticket.status === "OPEN" ||
                    ticket.status === "IN_PROGRESS") && (
                    <button
                      onClick={() =>
                        handleStatusChange("RESOLVED")
                      }
                      className="bg-green-600 text-white w-full py-2 rounded-xl"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              )}

            {/* Upload */}
            {(isCreator || isTechnician) &&
              ticket.status !== "CLOSED" && (
                <UploadImages
                  ticketId={id}
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

            <div className="text-xs text-gray-500 mt-6 border-t pt-3">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Comments */}
        <CommentSection
          ticket={ticket}
          currentUser={currentUser}
          onUpdate={loadTicket}
        />
      </div>
    </div>
  );
}