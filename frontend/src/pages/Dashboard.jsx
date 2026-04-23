import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  Building2,
  CalendarCheck,
  Wrench,
  Bell,
  ArrowRight,
  MapPin,
  Users,
  Clock3,
} from "lucide-react";

import AppLayout from "../components/AppLayout";
import Toast from "../components/Toast";
import TicketCard from "../components/TicketCard";

import { getResources } from "../api/resourceApi";
import { getMyBookings } from "../api/bookingApi";
import { getUserTickets } from "../services/ticketService";
import API from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();

  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const loadDashboard = async () => {
      if (!isLoaded || !user?.id) return;

      try {
        setLoading(true);

        const [resourcesRes, bookingsRes, ticketsRes, notificationsRes] =
          await Promise.all([
            getResources(),
            getMyBookings(),
            getUserTickets(user.id),
            API.get("/notifications"),
          ]);

        setResources(Array.isArray(resourcesRes.data) ? resourcesRes.data : []);
        setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
        setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
        setNotifications(
          Array.isArray(notificationsRes.data) ? notificationsRes.data : []
        );
      } catch (err) {
        showToast("Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [isLoaded, user?.id]);

  const stats = useMemo(() => {
    const activeResources = resources.filter((r) => r.status === "ACTIVE").length;
    const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
    const openTickets = tickets.filter(
      (t) => t.status === "OPEN" || t.status === "IN_PROGRESS"
    ).length;
    const unreadNotifications = notifications.filter((n) => !n.read).length;

    return {
      activeResources,
      pendingBookings,
      openTickets,
      unreadNotifications,
    };
  }, [resources, bookings, tickets, notifications]);

  const featuredResources = useMemo(
    () =>
      resources
        .filter((r) => r.status === "ACTIVE")
        .slice(0, 4),
    [resources]
  );

  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort((a, b) =>
          `${b.bookingDate || ""} ${b.startTime || ""}`.localeCompare(
            `${a.bookingDate || ""} ${a.startTime || ""}`
          )
        )
        .slice(0, 3),
    [bookings]
  );

  const recentTickets = useMemo(
    () =>
      [...tickets]
        .sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
        .slice(0, 3),
    [tickets]
  );

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
        <div>
          <h1 className="text-4xl font-bold text-zinc-900">
            Welcome back, {user?.firstName || user?.fullName || "User"} 👋
          </h1>
          <p className="text-zinc-500 mt-2">
            Manage campus facilities, bookings, tickets, and notifications in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-blue-700" />
            </div>
            <p className="text-sm text-zinc-500">Active Resources</p>
            <p className="text-3xl font-bold text-zinc-900 mt-1">
              {loading ? "..." : stats.activeResources}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
              <CalendarCheck className="w-6 h-6 text-amber-700" />
            </div>
            <p className="text-sm text-zinc-500">Pending Bookings</p>
            <p className="text-3xl font-bold text-zinc-900 mt-1">
              {loading ? "..." : stats.pendingBookings}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
              <Wrench className="w-6 h-6 text-red-700" />
            </div>
            <p className="text-sm text-zinc-500">Open Tickets</p>
            <p className="text-3xl font-bold text-zinc-900 mt-1">
              {loading ? "..." : stats.openTickets}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-emerald-700" />
            </div>
            <p className="text-sm text-zinc-500">Unread Notifications</p>
            <p className="text-3xl font-bold text-zinc-900 mt-1">
              {loading ? "..." : stats.unreadNotifications}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">
                Available Resources
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                Quickly access bookable halls, labs, rooms, and equipment.
              </p>
            </div>

            <button
              onClick={() => navigate("/resources")}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
              <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="text-zinc-500">Loading resources...</div>
          ) : featuredResources.length === 0 ? (
            <div className="text-zinc-500">No active resources available right now.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {featuredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-blue-50 border border-blue-100 rounded-3xl p-5 hover:bg-white hover:border-blue-200 transition-all cursor-pointer"
                  onClick={() => navigate("/resources")}
                >
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {resource.name}
                  </h3>

                  <div className="space-y-3 mt-4 text-sm text-zinc-700">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-zinc-500" />
                      {resource.type}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-zinc-500" />
                      {resource.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-zinc-500" />
                      Capacity: {resource.capacity}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="w-4 h-4 text-zinc-500" />
                      {resource.availability || "Not specified"}
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="inline-flex px-3 py-1 rounded-2xl text-xs font-semibold bg-emerald-100 text-emerald-700">
                      {resource.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">Recent Bookings</h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Your latest resource requests.
                </p>
              </div>

              <button
                onClick={() => navigate("/my-bookings")}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </button>
            </div>

            {loading ? (
              <div className="text-zinc-500">Loading bookings...</div>
            ) : recentBookings.length === 0 ? (
              <div className="text-zinc-500">No bookings yet.</div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-zinc-100 rounded-2xl p-4 bg-zinc-50"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="font-semibold text-zinc-900">
                          {booking.resourceName}
                        </h3>
                        <p className="text-sm text-zinc-500 mt-1">
                          {booking.bookingDate} • {booking.startTime} - {booking.endTime}
                        </p>
                        <p className="text-sm text-zinc-600 mt-2">
                          {booking.resourceLocation}
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-2xl text-xs font-semibold bg-blue-100 text-blue-700">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">Recent Tickets</h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Quick view of your latest incident reports.
                </p>
              </div>

              <button
                onClick={() => navigate("/my-tickets")}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </button>
            </div>

            {loading ? (
              <div className="text-zinc-500">Loading tickets...</div>
            ) : recentTickets.length === 0 ? (
              <div className="text-zinc-500">No tickets yet.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {recentTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}