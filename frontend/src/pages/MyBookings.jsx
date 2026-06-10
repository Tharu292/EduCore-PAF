import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import Toast from "../components/Toast";
import { getMyBookings, cancelBooking } from "../api/bookingApi";
import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await getMyBookings();
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("Failed to load your bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      await cancelBooking(id);
      showToast("Booking cancelled successfully");
      loadBookings();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to cancel booking", "error");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "CANCELLED":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <AppLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-zinc-900">My Bookings</h1>
        <p className="text-zinc-500 mt-2">
          Track your submitted, approved, rejected, and cancelled bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="text-zinc-500">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 shadow-lg text-zinc-500">
            No bookings found.
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-blue-50 hover:bg-white border border-blue-100 hover:border-blue-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-between items-start gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-zinc-900">
                    {booking.resourceName}
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    {booking.resourceType}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-2xl text-xs font-semibold ${getStatusClass(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="space-y-3 text-sm text-zinc-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-zinc-500" />
                  {booking.resourceLocation}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-zinc-500" />
                  {booking.bookingDate}
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="w-4 h-4 text-zinc-500" />
                  {booking.startTime} - {booking.endTime}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-500" />
                  {booking.expectedAttendees} attendees
                </div>
                <div>
                  <span className="font-medium">Purpose:</span> {booking.purpose}
                </div>
                {booking.adminReason && (
                  <div>
                    <span className="font-medium">Admin reason:</span>{" "}
                    {booking.adminReason}
                  </div>
                )}
              </div>

              {booking.status === "APPROVED" && (
                <div className="mt-5">
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="px-5 py-2.5 rounded-2xl border border-red-200 text-red-700 hover:bg-red-50 text-sm font-medium"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}