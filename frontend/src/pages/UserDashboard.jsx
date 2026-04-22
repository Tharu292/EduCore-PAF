import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpenCheck, CalendarClock, Mail, RotateCcw, User, XCircle } from "lucide-react";
import { cancelBooking, getStudentBookings } from "../api/bookingApi";

function UserDashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("smartCampusUser") || "{}");
  const [bookings, setBookings] = useState([]);

  const fetchBookings = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const res = await getStudentBookings(currentUser.id);
      setBookings(res.data || []);
    } catch (error) {
      toast.error("Failed to load your bookings");
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (id) => {
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled");
      fetchBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Cancel failed");
    }
  };

  const openReschedule = (booking) => {
    navigate("/resources", {
      state: {
        rescheduleBooking: booking,
      },
    });
  };

  const counts = {
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === "PENDING").length,
    approved: bookings.filter((booking) => booking.status === "APPROVED").length,
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-blue-600 text-white rounded-2xl p-8 mb-8">
          <p className="text-blue-100">Student Dashboard</p>
          <h1 className="text-4xl font-semibold mt-2">Welcome, {currentUser?.name || "Student"}</h1>
          <p className="text-blue-100 mt-3">View your details, request resources, and track booking approvals.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white border border-zinc-100 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-zinc-900 mb-5">My Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-100 rounded-2xl flex items-center justify-center">
                  <User className="w-5 h-5 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Name</p>
                  <p className="font-medium text-zinc-900">{currentUser?.name || "Not signed in"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-100 rounded-2xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Email</p>
                  <p className="font-medium text-zinc-900">{currentUser?.email || "-"}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/resources"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-5 py-3 font-medium"
              >
                <BookOpenCheck className="w-5 h-5" />
                Book Resource
              </Link>
              <a
                href="#my-bookings"
                className="flex items-center justify-center gap-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-2xl px-5 py-3 font-medium"
              >
                <CalendarClock className="w-5 h-5" />
                View My Bookings
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
            <SummaryCard label="Total" value={counts.total} />
            <SummaryCard label="Pending" value={counts.pending} tone="amber" />
            <SummaryCard label="Booked" value={counts.approved} tone="emerald" />
          </div>
        </div>

        <section id="my-bookings" className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
            <CalendarClock className="w-5 h-5 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900">My Bookings</h2>
          </div>

          <div className="p-6">
            {bookings.length === 0 ? (
              <p className="text-zinc-500">No bookings yet. Use the booking button to request a resource.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border border-zinc-200 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-zinc-900">{booking.resourceName}</h3>
                        <p className="text-sm text-zinc-500">{booking.bookingDate} | {booking.startTime} - {booking.endTime}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-sm text-zinc-700 mt-3">{booking.purpose}</p>
                    <p className="text-sm text-zinc-500 mt-2">Attendees: {booking.expectedAttendees}</p>
                    {booking.adminReason && (
                      <p className="text-sm text-zinc-500 mt-2">Admin reason: {booking.adminReason}</p>
                    )}
                    {["PENDING", "APPROVED"].includes(booking.status) && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => openReschedule(booking)}
                          className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-2xl text-sm font-medium"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reschedule
                        </button>
                        {booking.status === "APPROVED" && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-2xl text-sm font-medium"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone = "blue" }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  }[tone];

  return (
    <div className={`${toneClass} rounded-2xl p-5`}>
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

export default UserDashboard;
