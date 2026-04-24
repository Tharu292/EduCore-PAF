import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  Building2,
  CalendarCheck,
  Wrench,
  Bell,
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
    return {
      activeResources: resources.filter((r) => r.status === "ACTIVE").length,
      pendingBookings: bookings.filter((b) => b.status === "PENDING").length,
      openTickets: tickets.filter(
        (t) => t.status === "OPEN" || t.status === "IN_PROGRESS"
      ).length,
      unreadNotifications: notifications.filter((n) => !n.read).length,
    };
  }, [resources, bookings, tickets, notifications]);

  const featuredResources = useMemo(() => {
    return resources.filter((r) => r.status === "ACTIVE").slice(0, 4);
  }, [resources]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) =>
        `${b.bookingDate || ""} ${b.startTime || ""}`.localeCompare(
          `${a.bookingDate || ""} ${a.startTime || ""}`
        )
      )
      .slice(0, 3);
  }, [bookings]);

  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .slice(0, 3);
  }, [tickets]);

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
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#006591] via-[#006591] to-[#e31836] rounded-2xl p-8 text-white">
          <h1 className="text-2xl font-semibold">
            Welcome back, {user?.firstName || user?.fullName || "User"}
          </h1>
          <p className="mt-2 text-white/90">
            Manage campus facilities, bookings, and support tickets.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard icon={<Building2 />} label="Active Resources" value={stats.activeResources} />
          <StatCard icon={<CalendarCheck />} label="Pending Bookings" value={stats.pendingBookings} />
          <StatCard icon={<Wrench />} label="Open Tickets" value={stats.openTickets} />
          <StatCard icon={<Bell />} label="Unread Notifications" value={stats.unreadNotifications} />
        </div>

        {/* Resources */}
        <div className="bg-gray-50 rounded-3xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Available Resources
              </h2>
              <p className="text-gray-500 mt-1">
                Quickly access facilities and equipment
              </p>
            </div>

            <button
              onClick={() => navigate("/resources")}
              className="px-5 py-2.5 rounded-2xl text-sm font-medium text-[#006591] hover:bg-[#006591]/5 transition"
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">
              Loading resources...
            </div>
          ) : featuredResources.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No active resources available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {featuredResources.map((resource) => (
                <div
                  key={resource.id || resource._id}
                  onClick={() => navigate("/resources")}
                  className="group bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 
                             border border-gray-300 rounded-3xl p-6 cursor-pointer 
                             shadow-sm hover:shadow-xl hover:-translate-y-1 
                             transition-all duration-300"
                >
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#006591]">
                    {resource.name}
                  </h3>

                  {/* ✅ NEW DIVIDER LINE */}
                  <div className="mt-3 mb-4 h-[1px] bg-gray-300" />

                  {/* Content */}
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4" />
                      {resource.type}
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4" />
                      {resource.location}
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4" />
                      Capacity: {resource.capacity}
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock3 className="w-4 h-4" />
                      {resource.availability || "Not specified"}
                    </div>
                  </div>

                  <div className="mt-6">
                    <span className="inline-flex px-4 py-1.5 rounded-2xl text-xs font-semibold bg-emerald-100 text-emerald-700">
                      {resource.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Section title="Recent Bookings" onView={() => navigate("/my-bookings")}>
            {recentBookings.map((b) => (
              <div key={b.id || b._id} className="p-4 border rounded-2xl">
                {b.resourceName}
              </div>
            ))}
          </Section>

          <Section title="Recent Tickets" onView={() => navigate("/my-tickets")}>
            {recentTickets.map((t) => (
              <TicketCard key={t.id || t._id} ticket={t} />
            ))}
          </Section>
        </div>
      </div>
    </AppLayout>
  );
}

/* Components */

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-3xl border p-5">
      <div className="mb-3 text-[#006591]">{icon}</div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function Section({ title, children, onView }) {
  return (
    <div className="bg-white rounded-3xl border p-6">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        <button onClick={onView} className="text-sm text-[#006591]">
          View all
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}