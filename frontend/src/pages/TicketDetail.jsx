import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  MapPin,
  AlertTriangle,
  User,
  Wrench,
  TimerReset,
  Clock3,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";

import Toast from "../components/Toast";
import AppLayout from "../components/AppLayout";
import StatusBadge from "../components/StatusBadge";
import CommentSection from "../components/CommentSection";
import UploadImages from "../components/UploadImages";
import UserName from "../components/UserName";

import useCurrentUserRole from "../hooks/useCurrentUserRole";
import {
  getTicketById,
  updateStatus,
  removeAttachment,
} from "../services/ticketService";

function formatDuration(start, end) {
  if (!start || !end) return "—";
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (diffMs <= 0) return "—";

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

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

  const firstResponseTime = useMemo(
    () => formatDuration(ticket?.createdAt, ticket?.firstResponseAt),
    [ticket]
  );

  const resolutionTime = useMemo(
    () => formatDuration(ticket?.createdAt, ticket?.resolvedAt),
    [ticket]
  );

  const handleStatusChange = async (newStatus) => {
    if (!isAssigned && !isCreator && !isAdmin) return;
    if (!window.confirm(`Change status to ${newStatus}?`)) return;

    try {
      let reason = "";
      let resolutionNotes = "";

      if (newStatus === "REJECTED" && isAdmin) {
        reason = window.prompt("Enter rejection reason:") || "";
        if (!reason.trim()) {
          showToast("Rejection reason is required", "error");
          return;
        }
      }

      if (newStatus === "RESOLVED") {
        resolutionNotes = window.prompt("Add resolution notes (optional):") || "";
      }

      await updateStatus(id, newStatus, reason, resolutionNotes);
      showToast(`Status updated to ${newStatus}`, "success");
      loadTicket();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update status", "error");
    }
  };

  const handleRemoveImage = async (filename) => {
    if (!window.confirm("Remove this image?")) return;

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
      <div className="max-w-7xl mx-auto">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900">{ticket.title}</h1>
              <p className="text-zinc-500 mt-2">Ticket ID: {ticket.id}</p>
            </div>
            <StatusBadge status={ticket.status} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100">
                <h3 className="font-semibold text-lg mb-3 text-zinc-900">Description</h3>
                <p className="text-zinc-700 whitespace-pre-wrap leading-7">
                  {ticket.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-zinc-50 rounded-3xl p-5 border border-zinc-100">
                  <div className="flex items-center gap-2 mb-2 text-zinc-500 text-sm">
                    <MapPin className="w-4 h-4" />
                    Location / Resource
                  </div>
                  <p className="font-medium text-zinc-900">{ticket.location || "—"}</p>
                </div>

                <div className="bg-zinc-50 rounded-3xl p-5 border border-zinc-100">
                  <div className="flex items-center gap-2 mb-2 text-zinc-500 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Priority
                  </div>
                  <p className="font-medium text-zinc-900">{ticket.priority || "—"}</p>
                </div>

                <div className="bg-zinc-50 rounded-3xl p-5 border border-zinc-100">
                  <div className="flex items-center gap-2 mb-2 text-zinc-500 text-sm">
                    <User className="w-4 h-4" />
                    Created By
                  </div>
                  <p className="font-medium text-zinc-900">
                    <UserName clerkUserId={ticket.createdBy} currentUserId={currentUserId} />
                  </p>
                </div>

                <div className="bg-zinc-50 rounded-3xl p-5 border border-zinc-100">
                  <div className="flex items-center gap-2 mb-2 text-zinc-500 text-sm">
                    <Wrench className="w-4 h-4" />
                    Assigned To
                  </div>
                  <p className="font-medium text-zinc-900">
                    {ticket.assignedTo ? (
                      <UserName
                        clerkUserId={ticket.assignedTo}
                        currentUserId={currentUserId}
                      />
                    ) : (
                      "Not Assigned"
                    )}
                  </p>
                </div>

                <div className="bg-zinc-50 rounded-3xl p-5 border border-zinc-100">
                  <div className="flex items-center gap-2 mb-2 text-zinc-500 text-sm">
                    <Clock3 className="w-4 h-4" />
                    Time to First Response
                  </div>
                  <p className="font-medium text-zinc-900">{firstResponseTime}</p>
                </div>

                <div className="bg-zinc-50 rounded-3xl p-5 border border-zinc-100">
                  <div className="flex items-center gap-2 mb-2 text-zinc-500 text-sm">
                    <TimerReset className="w-4 h-4" />
                    Time to Resolution
                  </div>
                  <p className="font-medium text-zinc-900">{resolutionTime}</p>
                </div>
              </div>

              {ticket.resolutionNotes && (
                <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
                  <h3 className="font-semibold text-lg mb-3 text-emerald-900">
                    Resolution Notes
                  </h3>
                  <p className="text-emerald-800 whitespace-pre-wrap">
                    {ticket.resolutionNotes}
                  </p>
                </div>
              )}

              {ticket.rejectionReason && (
                <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
                  <h3 className="font-semibold text-lg mb-3 text-red-900">
                    Rejection Reason
                  </h3>
                  <p className="text-red-800 whitespace-pre-wrap">
                    {ticket.rejectionReason}
                  </p>
                </div>
              )}

              {ticket.attachments?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Paperclip className="w-5 h-5" />
                    Attachments ({ticket.attachments.length}/3)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ticket.attachments.map((filename, i) => (
                      <div
                        key={i}
                        className="relative group border border-zinc-200 rounded-3xl overflow-hidden bg-white"
                      >
                        <img
                          src={`http://localhost:8080/uploads/${filename}`}
                          alt="attachment"
                          className="w-full h-52 object-cover"
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

              <CommentSection
                ticket={ticket}
                currentUserId={currentUserId}
                onUpdate={loadTicket}
                showToast={showToast}
              />
            </div>

            <div className="bg-zinc-50 rounded-3xl p-6 h-fit border border-zinc-100">
              <h3 className="font-semibold text-lg mb-4 text-zinc-900">Ticket Actions</h3>

              {(isAssigned || isCreator || isAdmin) &&
                ticket.status !== "CLOSED" &&
                ticket.status !== "REJECTED" && (
                  <div className="space-y-3">
                    {ticket.status === "OPEN" && (
                      <button
                        onClick={() => handleStatusChange("IN_PROGRESS")}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-2xl"
                      >
                        Start Work
                      </button>
                    )}

                    {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") &&
                      (isAssigned || isAdmin) && (
                        <button
                          onClick={() => handleStatusChange("RESOLVED")}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl"
                        >
                          Mark as Resolved
                        </button>
                      )}

                    {ticket.status === "RESOLVED" && (
                      <button
                        onClick={() => handleStatusChange("CLOSED")}
                        className="w-full bg-zinc-900 hover:bg-black text-white py-3 rounded-2xl"
                      >
                        Close Ticket
                      </button>
                    )}

                    {isAdmin &&
                      (ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
                        <button
                          onClick={() => handleStatusChange("REJECTED")}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl"
                        >
                          Reject Ticket
                        </button>
                      )}
                  </div>
                )}

              {(isCreator || isAssigned || isAdmin) && (
                <div className="mt-6">
                  <UploadImages
                    ticketId={id}
                    onUploadSuccess={loadTicket}
                    showToast={showToast}
                  />
                </div>
              )}

              <div className="mt-8 space-y-4">
                <div className="bg-white border border-zinc-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    Comments
                  </div>
                  <p className="font-medium text-zinc-900">
                    {ticket.comments?.length || 0}
                  </p>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments
                  </div>
                  <p className="font-medium text-zinc-900">
                    {ticket.attachments?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}