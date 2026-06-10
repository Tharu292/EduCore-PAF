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
  X,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";

import Toast from "../components/Toast";
import AppLayout from "../components/AppLayout";
import StatusBadge from "../components/StatusBadge";
import CommentSection from "../components/CommentSection";
import UploadImages from "../components/UploadImages";
import UserName from "../components/UserName";

import useCurrentUserRole from "../hooks/useCurrentUserRole";
import { getTicketById, updateStatus, removeAttachment } from "../services/ticketService";

function formatDuration(start, end) {
  if (!start || !end) return "Not recorded yet";

  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (diffMs <= 0) return "Not recorded yet";

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  if (!days && !hours && !minutes) parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);

  return parts.join(" ");
}

function formatDateTime(value) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { role } = useCurrentUserRole();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const currentUserId = user?.id;
  const isCreator = currentUserId === ticket?.createdBy;
  const isAssigned = currentUserId === ticket?.assignedTo;
  const isAdmin = role === "ADMIN";
  const isTechnician = role === "TECHNICIAN";

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

  const canStartWork =
    ticket?.status === "OPEN" && (isAssigned || isAdmin);

  const canResolve =
    ticket?.status === "IN_PROGRESS" && (isAssigned || isAdmin);

  const canClose =
    ticket?.status === "RESOLVED" && (isCreator || isAdmin);

  const canReject =
    isAdmin && (ticket?.status === "OPEN" || ticket?.status === "IN_PROGRESS");

  const canUpload =
    ticket?.status !== "CLOSED" &&
    ticket?.status !== "REJECTED" &&
    (isCreator || isAssigned || isAdmin);

  const handleSimpleStatusChange = async (newStatus) => {
    setSubmittingAction(true);
    try {
      await updateStatus(id, newStatus);
      showToast(`Status updated to ${newStatus}`, "success");
      loadTicket();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update status", "error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();

    if (!resolutionNotes.trim()) {
      showToast("Resolution notes are required", "error");
      return;
    }

    setSubmittingAction(true);
    try {
      await updateStatus(id, "RESOLVED", "", resolutionNotes.trim());
      showToast("Ticket marked as resolved", "success");
      setShowResolveModal(false);
      setResolutionNotes("");
      loadTicket();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to resolve ticket", "error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();

    if (!rejectionReason.trim()) {
      showToast("Rejection reason is required", "error");
      return;
    }

    setSubmittingAction(true);
    try {
      await updateStatus(id, "REJECTED", rejectionReason.trim(), "");
      showToast("Ticket rejected", "success");
      setShowRejectModal(false);
      setRejectionReason("");
      loadTicket();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to reject ticket", "error");
    } finally {
      setSubmittingAction(false);
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft size={20} /> Back
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
                <p className="text-zinc-700 whitespace-pre-wrap leading-7">{ticket.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoBox icon={<MapPin />} label="Location / Resource" value={ticket.location || "—"} />
                <InfoBox icon={<AlertTriangle />} label="Priority" value={ticket.priority || "—"} />

                <InfoBox
                  icon={<User />}
                  label="Created By"
                  value={<UserName clerkUserId={ticket.createdBy} currentUserId={currentUserId} />}
                />

                <InfoBox
                  icon={<Wrench />}
                  label="Assigned To"
                  value={
                    ticket.assignedTo ? (
                      <UserName clerkUserId={ticket.assignedTo} currentUserId={currentUserId} />
                    ) : (
                      "Not Assigned"
                    )
                  }
                />

                <InfoBox icon={<Clock3 />} label="Created At" value={formatDateTime(ticket.createdAt)} />
                <InfoBox icon={<Clock3 />} label="Assigned At" value={formatDateTime(ticket.assignedAt)} />
                <InfoBox icon={<Clock3 />} label="First Response At" value={formatDateTime(ticket.firstResponseAt)} />
                <InfoBox icon={<Clock3 />} label="Due At" value={formatDateTime(ticket.dueAt)} />
                <InfoBox icon={<TimerReset />} label="Time to First Response" value={firstResponseTime} />
                <InfoBox icon={<TimerReset />} label="Time to Resolution" value={resolutionTime} />
              </div>

              {ticket.resolutionNotes && (
                <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
                  <h3 className="font-semibold text-lg mb-3 text-emerald-900">Resolution Notes</h3>
                  <p className="text-emerald-800 whitespace-pre-wrap">{ticket.resolutionNotes}</p>
                </div>
              )}

              {ticket.rejectionReason && (
                <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
                  <h3 className="font-semibold text-lg mb-3 text-red-900">Rejection Reason</h3>
                  <p className="text-red-800 whitespace-pre-wrap">{ticket.rejectionReason}</p>
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
                      <div key={i} className="relative group border border-zinc-200 rounded-3xl overflow-hidden bg-white">
                        <img
                          src={`http://localhost:8080/uploads/${filename}`}
                          alt="attachment"
                          className="w-full h-52 object-cover"
                        />
                        {canUpload && (
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

              <div className="space-y-3">
                {canStartWork && (
                  <button
                    disabled={submittingAction}
                    onClick={() => handleSimpleStatusChange("IN_PROGRESS")}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-2xl disabled:opacity-60"
                  >
                    Start Work
                  </button>
                )}

                {canResolve && (
                  <button
                    disabled={submittingAction}
                    onClick={() => setShowResolveModal(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl disabled:opacity-60"
                  >
                    Mark as Resolved
                  </button>
                )}

                {canClose && (
                  <button
                    disabled={submittingAction}
                    onClick={() => handleSimpleStatusChange("CLOSED")}
                    className="w-full bg-zinc-900 hover:bg-black text-white py-3 rounded-2xl disabled:opacity-60"
                  >
                    Close Ticket
                  </button>
                )}

                {canReject && (
                  <button
                    disabled={submittingAction}
                    onClick={() => setShowRejectModal(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl disabled:opacity-60"
                  >
                    Reject Ticket
                  </button>
                )}

                {!canStartWork && !canResolve && !canClose && !canReject && (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-4 text-sm text-zinc-500">
                    No available actions for your role at this status.
                  </div>
                )}
              </div>

              {canUpload && (
                <div className="mt-6">
                  <UploadImages ticketId={id} onUploadSuccess={loadTicket} showToast={showToast} />
                </div>
              )}

              <div className="mt-8 space-y-4">
                <SmallStat icon={<MessageSquare />} label="Comments" value={ticket.comments?.length || 0} />
                <SmallStat icon={<Paperclip />} label="Attachments" value={ticket.attachments?.length || 0} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showResolveModal && (
        <ActionModal title="Resolve Ticket" onClose={() => setShowResolveModal(false)}>
          <form onSubmit={handleResolve} className="space-y-4">
            <p className="text-sm text-zinc-500">
              Add clear notes about how the issue was fixed. This will be visible to the user/admin.
            </p>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={5}
              className="w-full border border-zinc-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="Example: Projector HDMI cable replaced and display tested successfully."
            />
            <button
              disabled={submittingAction}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl disabled:opacity-60"
            >
              Save Resolution
            </button>
          </form>
        </ActionModal>
      )}

      {showRejectModal && (
        <ActionModal title="Reject Ticket" onClose={() => setShowRejectModal(false)}>
          <form onSubmit={handleReject} className="space-y-4">
            <p className="text-sm text-zinc-500">
              Give a reason so the user understands why the ticket was rejected.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={5}
              className="w-full border border-zinc-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="Example: Duplicate ticket already exists for this issue."
            />
            <button
              disabled={submittingAction}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl disabled:opacity-60"
            >
              Reject Ticket
            </button>
          </form>
        </ActionModal>
      )}
    </AppLayout>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div className="bg-zinc-50 rounded-3xl p-5 border border-zinc-100">
      <div className="flex items-center gap-2 mb-2 text-zinc-500 text-sm">
        <span className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
        {label}
      </div>
      <p className="font-medium text-zinc-900">{value}</p>
    </div>
  );
}

function SmallStat({ icon, label, value }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
        <span className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
        {label}
      </div>
      <p className="font-medium text-zinc-900">{value}</p>
    </div>
  );
}

function ActionModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[9998] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-7 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-zinc-400 hover:text-zinc-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}