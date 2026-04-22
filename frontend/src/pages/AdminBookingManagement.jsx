import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarClock, CheckCircle2, Filter, RefreshCw, Users, XCircle } from "lucide-react";
import { approveBooking, getAllBookings, rejectBooking } from "../api/bookingApi";

function AdminBookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [bookingStatus, setBookingStatus] = useState("");
  const [reviewReasons, setReviewReasons] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await getAllBookings(bookingStatus);
      setBookings(res.data || []);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setIsRefreshing(false);
    }
  }, [bookingStatus]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const setReason = (bookingId, reason) => {
    setReviewReasons({ ...reviewReasons, [bookingId]: reason });
  };

  const handleApprove = async (bookingId) => {
    try {
      await approveBooking(bookingId, reviewReasons[bookingId] || "Approved");
      toast.success("Booking approved");
      fetchBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Approve failed");
    }
  };

  const handleReject = async (bookingId) => {
    const reason = reviewReasons[bookingId] || "";
    if (!reason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }

    try {
      await rejectBooking(bookingId, reason);
      toast.success("Booking rejected");
      fetchBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reject failed");
    }
  };

  const pendingCount = bookings.filter((booking) => booking.status === "PENDING").length;
  const approvedCount = bookings.filter((booking) => booking.status === "APPROVED").length;
  const rejectedCount = bookings.filter((booking) => booking.status === "REJECTED").length;

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-zinc-500">Admin</p>
            <h1 className="text-4xl font-semibold text-zinc-900 tracking-tight">Booking Management</h1>
            <p className="text-zinc-600 mt-2">Review booking requests and manage approvals.</p>
          </div>

          <button
            onClick={fetchBookings}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium text-zinc-700 disabled:opacity-70 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <SummaryCard label="Pending" value={pendingCount} tone="amber" />
          <SummaryCard label="Booked" value={approvedCount} tone="emerald" />
          <SummaryCard label="Rejected" value={rejectedCount} tone="red" />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-100 bg-zinc-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarClock className="w-5 h-5 text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-800">Booking Requests</h2>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-500" />
              <select
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value)}
                className="border border-zinc-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-400"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Booked</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="p-8">
            {bookings.length === 0 ? (
              <p className="text-zinc-500">No booking requests found.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border border-zinc-200 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-zinc-900">{booking.resourceName}</h3>
                        <p className="text-sm text-zinc-500">{booking.resourceLocation}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <p><span className="text-zinc-500">Student:</span> {booking.studentName}</p>
                      <p className="flex items-center gap-1"><Users className="w-4 h-4 text-zinc-400" /> {booking.expectedAttendees} seats</p>
                      <p><span className="text-zinc-500">Date:</span> {booking.bookingDate}</p>
                      <p><span className="text-zinc-500">Time:</span> {booking.startTime} - {booking.endTime}</p>
                    </div>

                    <p className="mt-4 text-sm text-zinc-700">{booking.purpose}</p>
                    {booking.adminReason && (
                      <p className="mt-3 text-sm text-zinc-500">Reason: {booking.adminReason}</p>
                    )}

                    {booking.status === "PENDING" && (
                      <div className="mt-5 space-y-3">
                        <input
                          value={reviewReasons[booking.id] || ""}
                          onChange={(e) => setReason(booking.id, e.target.value)}
                          placeholder="Approval or rejection reason"
                          className="w-full border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-400"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(booking.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-2.5 text-sm font-medium"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(booking.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl py-2.5 text-sm font-medium"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone }) {
  const toneClass = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  }[tone];

  return (
    <div className={`${toneClass} rounded-3xl p-6 border border-white`}>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm font-medium mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-zinc-100 text-zinc-600",
    PENDING: "bg-amber-100 text-amber-700",
  };

  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-2xl ${styles[status] || styles.PENDING}`}>
      {status === "APPROVED" ? "BOOKED" : status}
    </span>
  );
}

export default AdminBookingManagement;
