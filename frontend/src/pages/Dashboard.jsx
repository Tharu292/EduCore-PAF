import React, { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Ticket, AlertCircle, CheckCircle, Plus, LogOut, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AppLayout from "../components/AppLayout";
import TicketCard from "../components/TicketCard";
import NotificationPanel from "../components/NotificationPanel";
import { getMyTickets, getAllTickets, getTechnicianTickets } from "../services/ticketService";
import useCurrentUserRole from "../hooks/useCurrentUserRole";

export default function Dashboard() {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { role: userRole } = useCurrentUserRole();

  const [myTickets, setMyTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [techTickets, setTechTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const requests = [getAllTickets()];

        if (userRole === "USER") requests.unshift(getMyTickets(user.id));
        if (userRole === "TECHNICIAN") requests.unshift(getTechnicianTickets(user.id));

        const responses = await Promise.all(requests);

        if (userRole === "USER") {
          setMyTickets(responses[0].data || []);
          setAllTickets(responses[1].data || []);
        } else if (userRole === "TECHNICIAN") {
          setTechTickets(responses[0].data || []);
          setAllTickets(responses[1].data || []);
        } else {
          setAllTickets(responses[0].data || []);
        }
      } catch (err) {
        console.error("Failed to load tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user?.id && userRole) {
      fetchTickets();
    }
  }, [isLoaded, user?.id, userRole]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      {/* Smaller Gradient Welcome Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl">
        <div 
          className="h-32 md:h-40 flex items-center px-8 md:px-10 bg-gradient-to-r from-[#e31836] to-[#006591]"
          style={{
            background: 'linear-gradient(135deg, #e31836 0%, #006591 100%)'
          }}
        >
          <div className="flex-1">
            <h1 className="text-white text-2xl md:text-3xl font-semibold tracking-tight">
              Welcome back, {user?.firstName || "User"}!
            </h1>
            <p className="text-white/90 text-sm md:text-base mt-1">
              Here&apos;s what&apos;s happening with your workspace
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => signOut({ redirectUrl: "/login" })}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 
                       backdrop-blur-md text-white rounded-2xl transition-all border border-white/20 
                       text-sm whitespace-nowrap"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </div>

      {/* Rest of your dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {userRole === "USER" && (
          <StatCard title="My Tickets" value={myTickets.length} icon={<Ticket className="text-blue-600" />} />
        )}
        {userRole === "TECHNICIAN" && (
          <StatCard title="Assigned To Me" value={techTickets.length} icon={<Ticket className="text-amber-600" />} />
        )}
        <StatCard title="Open Tickets" value={allTickets.filter(t => t.status === "OPEN").length} icon={<AlertCircle className="text-amber-600" />} />
        <StatCard title="Resolved" value={allTickets.filter(t => t.status === "RESOLVED").length} icon={<CheckCircle className="text-green-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">
          {userRole === "USER" && (
            <div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold">My Recent Tickets</h2>
                <button
                  onClick={() => navigate("/my-tickets")}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  View All →
                </button>
              </div>
              {loading ? (
                <p className="text-gray-500">Loading your tickets...</p>
              ) : myTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myTickets.slice(0, 4).map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} onClick={() => navigate(`/ticket/${ticket.id}`)} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">You haven&apos;t created any tickets yet.</p>
              )}
            </div>
          )}

          {userRole === "TECHNICIAN" && (
            <div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold">Assigned Tickets</h2>
                <button
                  onClick={() => navigate("/technician")}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  View All →
                </button>
              </div>
              {loading ? (
                <p className="text-gray-500">Loading assigned tickets...</p>
              ) : techTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {techTickets.slice(0, 4).map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} onClick={() => navigate(`/ticket/${ticket.id}`)} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No tickets assigned to you yet.</p>
              )}
            </div>
          )}

          {(userRole === "ADMIN" || userRole === "USER" || userRole === "TECHNICIAN") && (
            <div>
              <h2 className="text-xl font-semibold mb-5">Open Tickets (Campus Wide)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allTickets
                  .filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS")
                  .slice(0, 6)
                  .map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} onClick={() => navigate(`/ticket/${ticket.id}`)} />
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl shadow p-6">
            <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
              <Bell size={20} /> Recent Notifications
            </h2>
            <NotificationPanel />
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <h2 className="font-semibold text-lg mb-5">Quick Actions</h2>
            <div className="space-y-3">
              {userRole === "USER" && (
                <>
                  <button
                    onClick={() => navigate("/create")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition"
                  >
                    <Plus size={20} /> Create New Ticket
                  </button>

                  <button
                    onClick={() => navigate("/my-tickets")}
                    className="w-full border border-gray-300 hover:bg-gray-50 py-4 rounded-2xl font-medium transition"
                  >
                    View My Tickets
                  </button>
                </>
              )}

              {userRole === "TECHNICIAN" && (
                <button
                  onClick={() => navigate("/technician")}
                  className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 py-4 rounded-2xl font-medium transition"
                >
                  Go to Technician Dashboard
                </button>
              )}

              {userRole === "ADMIN" && (
                <button
                  onClick={() => navigate("/admin")}
                  className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-4 rounded-2xl font-medium transition"
                >
                  Go to Admin Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-3xl shadow flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-4xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
    <div className="text-4xl opacity-80">{icon}</div>
  </div>
);