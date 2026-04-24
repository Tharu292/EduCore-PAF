import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Ticket,
  BarChart3,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  UserCog,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import API from "../api/axios";
import AppLayout from "../components/AppLayout";
import Toast from "../components/Toast";
import StatusBadge from "../components/StatusBadge";
import UserName from "../components/UserName";
import { getResources } from "../api/resourceApi";
import { assignTechnician } from "../services/ticketService";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState("analytics");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      const [usersRes, ticketsRes, resourcesRes] = await Promise.all([
        API.get("/admin/users"),
        API.get("/tickets"),
        getResources(),
      ]);

      setUsers(usersRes.data || []);
      setTickets(ticketsRes.data || []);
      setResources(resourcesRes.data || []);
    } catch (err) {
      showToast("Failed to load admin data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateUserRole = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/roles`, [newRole, "USER"]);
      showToast(`Role updated to ${newRole}`, "success");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update role", "error");
    }
  };

  const handleAssignTechnician = async (ticketId, technicianClerkId) => {
    if (!technicianClerkId) return;

    try {
      await assignTechnician(ticketId, technicianClerkId);
      showToast("Technician assigned successfully", "success");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to assign technician", "error");
    }
  };

  const technicians = users.filter((u) => u.roles?.includes("TECHNICIAN"));

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      totalResources: resources.length,
      activeResources: resources.filter((r) => r.status === "ACTIVE").length,
      openTickets: tickets.filter((t) => t.status === "OPEN").length,
      inProgressTickets: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      resolvedTickets: tickets.filter((t) => t.status === "RESOLVED").length,
    };
  }, [users, resources, tickets]);

  const topResourcesData = useMemo(() => {
    return [...resources]
      .filter((resource) => resource.capacity)
      .sort((a, b) => Number(b.capacity) - Number(a.capacity))
      .slice(0, 6)
      .map((resource) => ({
        name: resource.name || "Unnamed",
        capacity: Number(resource.capacity || 0),
      }));
  }, [resources]);

  const getBarColor = (index, total) => {
    if (index === 0) return "#111827"; // highest black
    if (index === total - 1) return "#e31836"; // least red
    return "#006591"; // middle blue
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading Admin Dashboard...
      </div>
    );
  }

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
        <div className="bg-gradient-to-r from-[#006591] via-[#006591] to-[#e31836] rounded-2xl p-8 text-white">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="mt-2 text-white/90">
            Manage users, bookings, resources, and all maintenance tickets.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 border-b border-gray-200">
          <TabButton active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} icon={<BarChart3 size={20} />} label="Analytics" />
          <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users size={20} />} label="Users" />
          <TabButton active={activeTab === "tickets"} onClick={() => setActiveTab("tickets")} icon={<Ticket size={20} />} label="Tickets" />
        </div>

        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="text-[#006591]" />} tone="blue" />
              <StatCard title="Total Resources" value={stats.totalResources} icon={<Package className="text-black" />} tone="black" />
              <StatCard title="Active Resources" value={stats.activeResources} icon={<CheckCircle2 className="text-emerald-600" />} tone="green" />
              <StatCard title="Open Tickets" value={stats.openTickets} icon={<AlertTriangle className="text-red-600" />} tone="red" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <StatCard title="In Progress Tickets" value={stats.inProgressTickets} icon={<Clock3 className="text-amber-600" />} tone="amber" />
              <StatCard title="Resolved Tickets" value={stats.resolvedTickets} icon={<CheckCircle2 className="text-emerald-600" />} tone="green" />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Top Resources by Capacity
                </h2>
                <p className="text-gray-500 mt-1">
                  Largest bookable campus resources based on seating or usage capacity.
                </p>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topResourcesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="capacity">
                      {topResourcesData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}-${index}`}
                          fill={getBarColor(index, topResourcesData.length)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
              <p className="text-gray-500 mt-1">
                Manage user roles for USER, TECHNICIAN, and ADMIN access.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 text-sm text-gray-500">
                    <th className="px-8 py-4 text-left font-semibold">User</th>
                    <th className="px-8 py-4 text-left font-semibold">Email</th>
                    <th className="px-8 py-4 text-left font-semibold">Roles</th>
                    <th className="px-8 py-4 text-right font-semibold">Update Role</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#006591]/10 text-[#006591] flex items-center justify-center font-bold">
                            {(u.name || u.email || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {u.name || "Unnamed User"}
                            </p>
                            <p className="text-xs text-gray-400">{u.clerkUserId}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5 text-gray-600">{u.email}</td>

                      <td className="px-8 py-5">
                        <div className="flex gap-2 flex-wrap">
                          {u.roles?.map((role) => (
                            <span
                              key={role}
                              className={`px-3 py-1 text-xs rounded-full font-semibold ${
                                role === "ADMIN"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : role === "TECHNICIAN"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <select
                          defaultValue=""
                          onChange={(e) => updateUserRole(u.id, e.target.value)}
                          className="border border-gray-200 bg-white rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#006591]"
                        >
                          <option value="" disabled>Select role</option>
                          <option value="USER">USER</option>
                          <option value="TECHNICIAN">TECHNICIAN</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                All Tickets ({tickets.length})
              </h2>
              <p className="text-gray-500 mt-1">
                Assign technicians and monitor ticket progress.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="group bg-blue-50 hover:bg-white border border-blue-100 hover:border-blue-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6 pb-4 border-b border-blue-100">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#006591] transition">
                          {ticket.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {ticket.category} • {ticket.priority}
                        </p>
                      </div>
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {ticket.description}
                    </p>

                    <div className="bg-white rounded-2xl p-4 text-sm space-y-2 border border-blue-100">
                      <p>
                        <span className="text-gray-500">Location:</span>{" "}
                        <span className="font-medium text-gray-900">
                          {ticket.location || "—"}
                        </span>
                      </p>

                      <p>
                        <span className="text-gray-500">Created By:</span>{" "}
                        <span className="font-medium text-gray-900">
                          <UserName clerkUserId={ticket.createdBy} />
                        </span>
                      </p>

                      <p>
                        <span className="text-gray-500">Assigned:</span>{" "}
                        <span className="font-medium text-gray-900">
                          {ticket.assignedTo ? (
                            <UserName clerkUserId={ticket.assignedTo} />
                          ) : (
                            "Not assigned"
                          )}
                        </span>
                      </p>
                    </div>

                    <div className="pt-2">
                      <label className="text-xs font-semibold text-gray-500 mb-2 block">
                        ASSIGN TECHNICIAN
                      </label>
                      <div className="relative">
                        <UserCog className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <select
                          defaultValue=""
                          onChange={(e) => handleAssignTechnician(ticket.id, e.target.value)}
                          className="w-full border border-gray-200 bg-white rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#006591]"
                        >
                          <option value="">Select technician</option>
                          {technicians.map((tech) => (
                            <option key={tech.id} value={tech.clerkUserId}>
                              {tech.name || tech.email}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-4 font-medium text-lg transition-all ${
        active
          ? "border-b-4 border-[#006591] text-[#006591]"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
    </button>
  );
}

function StatCard({ title, value, icon, tone }) {
  const tones = {
    blue: "bg-[#006591]/10",
    black: "bg-gray-100",
    green: "bg-emerald-100",
    red: "bg-red-100",
    amber: "bg-amber-100",
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
        </div>

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}