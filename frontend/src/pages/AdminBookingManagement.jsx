import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Filter,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { approveBooking, getAllBookings, rejectBooking } from "../api/bookingApi";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Booked", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const STATUS_ORDER = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  CANCELLED: 3,
};

function AdminBookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [bookingStatus, setBookingStatus] = useState("");
  const [searchText, setSearchText] = useState("");
  const [reviewReasons, setReviewReasons] = useState({});
  const [processingId, setProcessingId] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await getAllBookings();
      setBookings(res.data || []);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = useMemo(() => {
    const term = searchText.trim().toLowerCase();

    return [...bookings]
      .filter((booking) => !bookingStatus || booking.status === bookingStatus)
      .filter((booking) => {
        if (!term) return true;

        return [
          booking.resourceName,
          booking.resourceLocation,
          booking.studentName,
          booking.studentEmail,
          booking.purpose,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      })
      .sort((a, b) => {
        const statusSort = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
        if (statusSort !== 0) return statusSort;
        return `${b.bookingDate || ""} ${b.startTime || ""}`.localeCompare(
          `${a.bookingDate || ""} ${a.startTime || ""}`
        );
      });
  }, [bookings, bookingStatus, searchText]);

  const counts = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === "PENDING").length,
      approved: bookings.filter((booking) => booking.status === "APPROVED").length,
      rejected: bookings.filter((booking) => booking.status === "REJECTED").length,
      cancelled: bookings.filter((booking) => booking.status === "CANCELLED").length,
    }),
    [bookings]
  );

  const setReason = (bookingId, reason) => {
    setReviewReasons((current) => ({ ...current, [bookingId]: reason }));
  };

  const clearReason = (bookingId) => {
    setReviewReasons((current) => {
      const next = { ...current };
      delete next[bookingId];
      return next;
    });
  };

  const handleApprove = async (bookingId) => {
    setProcessingId(bookingId);
    try {
      await approveBooking(bookingId, reviewReasons[bookingId] || "Approved");
      toast.success("Booking approved and email sent");
      clearReason(bookingId);
      fetchBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Approve failed");
    } finally {
      setProcessingId("");
    }
  };

  const handleReject = async (bookingId) => {
    const reason = reviewReasons[bookingId] || "";
    if (!reason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }

    setProcessingId(bookingId);
    try {
      await rejectBooking(bookingId, reason);
      toast.success("Booking rejected and email sent");
      clearReason(bookingId);
      fetchBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reject failed");
    } finally {
      setProcessingId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              to="/admin"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Admin Review Queue</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Booking Management
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Review pending requests, approve verified bookings, and send clear rejection reasons to students.
            </p>
          </div>

          <button
            onClick={fetchBookings}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-70"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <SummaryCard label="Total" value={counts.total} tone="slate" />
          <SummaryCard label="Pending" value={counts.pending} tone="amber" />
          <SummaryCard label="Booked" value={counts.approved} tone="emerald" />
          <SummaryCard label="Rejected" value={counts.rejected} tone="red" />
          <SummaryCard label="Cancelled" value={counts.cancelled} tone="zinc" />
        </div>

        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => setBookingStatus(filter.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    bookingStatus === filter.value
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search student, resource, location"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:w-80"
                />
              </label>

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-500">
                <Filter className="h-4 w-4" />
                {filteredBookings.length} shown
              </div>
            </div>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <EmptyState hasBookings={bookings.length > 0} />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                reason={reviewReasons[booking.id] || ""}
                isProcessing={processingId === booking.id}
                onReasonChange={(value) => setReason(booking.id, value)}
                onApprove={() => handleApprove(booking.id)}
                onReject={() => handleReject(booking.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking, reason, isProcessing, onReasonChange, onApprove, onReject }) {
  const isPending = booking.status === "PENDING";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.status} />
            <span className="text-xs font-medium text-slate-400">ID: {shortId(booking.id)}</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-slate-950">{booking.resourceName || "Resource"}</h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4" />
            {booking.resourceLocation || "Location not set"}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 px-4 py-3 text-left sm:text-right">
          <p className="text-sm font-semibold text-slate-950">{formatDate(booking.bookingDate)}</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 sm:justify-end">
            <Clock3 className="h-4 w-4" />
            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InfoTile label="Student" value={booking.studentName || "Student"} />
        <InfoTile
          icon={<Users className="h-4 w-4" />}
          label="Seats"
          value={`${booking.expectedAttendees || 0} requested`}
        />
        <InfoTile label="Type" value={booking.resourceType || "Resource"} />
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Purpose</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{booking.purpose || "No purpose provided"}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
        {booking.studentEmail && (
          <span className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {booking.studentEmail}
          </span>
        )}
        {booking.adminReason && (
          <span className="rounded-lg bg-slate-100 px-3 py-1 text-slate-600">
            Admin note: {booking.adminReason}
          </span>
        )}
      </div>

      {isPending && (
        <div className="mt-5 border-t border-slate-100 pt-5">
          <label className="text-sm font-semibold text-slate-700" htmlFor={`reason-${booking.id}`}>
            Admin message
          </label>
          <textarea
            id={`reason-${booking.id}`}
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder="Add approval note or rejection reason"
            rows={3}
            className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={onApprove}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve & Send QR
            </button>
            <button
              onClick={onReject}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
            >
              <XCircle className="h-4 w-4" />
              Reject & Email Reason
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function SummaryCard({ label, value, tone }) {
  const styles = {
    slate: "border-slate-200 bg-white text-slate-950",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    red: "border-red-200 bg-red-50 text-red-800",
    zinc: "border-zinc-200 bg-zinc-50 text-zinc-700",
  };

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${styles[tone] || styles.slate}`}>
      <p className="text-3xl font-semibold leading-none">{value}</p>
      <p className="mt-2 text-sm font-semibold">{label}</p>
    </div>
  );
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-4 py-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-800" title={value}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    APPROVED: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    REJECTED: "bg-red-100 text-red-700 ring-red-200",
    CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200",
    PENDING: "bg-amber-100 text-amber-700 ring-amber-200",
  };

  return (
    <span
      className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${
        styles[status] || styles.PENDING
      }`}
    >
      {status === "APPROVED" ? "Booked" : status || "Pending"}
    </span>
  );
}

function EmptyState({ hasBookings }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <CalendarClock className="mx-auto h-10 w-10 text-slate-300" />
      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        {hasBookings ? "No matching bookings" : "No bookings yet"}
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        {hasBookings
          ? "Try another status tab or search keyword."
          : "Student booking requests will appear here for admin review."}
      </p>
    </div>
  );
}

function shortId(id) {
  if (!id) return "N/A";
  return id.length > 8 ? id.slice(-8).toUpperCase() : id.toUpperCase();
}

function formatDate(value) {
  if (!value) return "Date not set";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatTime(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(`2026-01-01T${value}`));
}

export default AdminBookingManagement;
