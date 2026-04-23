import React, { useState, useEffect } from "react";
import { Users, Ticket } from "lucide-react";
import API from "../api/axios";
import Toast from "../components/Toast";
import AppLayout from "../components/AppLayout";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      const [usersRes, ticketsRes] = await Promise.all([
        API.get("/admin/users"),
        API.get("/tickets")
      ]);
      setUsers(usersRes.data || []);
      setTickets(ticketsRes.data || []);
    } catch (err) {
      showToast("Failed to load data", "error");
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
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, roles: [newRole, "USER"] } : u
        )
      );
      showToast(`Role updated to ${newRole}`, "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update role", "error");
    }
  };

  const assignTechnician = async (ticketId, technicianClerkId) => {
    if (!technicianClerkId) return;
    try {
      await API.post(`/tickets/${ticketId}/assign?technicianClerkId=${technicianClerkId}`);
      showToast("Technician assigned successfully", "success");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to assign technician", "error");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Admin Dashboard...</div>;
  }

  return (
    <AppLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage users and all maintenance tickets</p>
      </div>

      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-4 px-8 font-medium text-lg transition-all ${
            activeTab === "users"
              ? "border-b-4 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          👥 Users Management
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`pb-4 px-8 font-medium text-lg transition-all ${
            activeTab === "tickets"
              ? "border-b-4 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🎟️ All Tickets
        </button>
      </div>

      {activeTab === "users" && (
        <div className="bg-white rounded-3xl shadow p-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Users size={28} /> All Users
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left">User</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Current Roles</th>
                  <th className="px-6 py-4 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-5">
                      <div className="font-medium">{u.name || "Unnamed User"}</div>
                    </td>
                    <td className="px-6 py-5 text-gray-600">{u.email}</td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        {u.roles?.map((role) => (
                          <span key={role} className="px-4 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <select
                        defaultValue=""
                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                        className="border border-gray-300 rounded-xl px-4 py-2 text-sm"
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
        <div className="bg-white rounded-3xl shadow p-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Ticket size={28} /> All Tickets ({tickets.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border border-gray-200 rounded-3xl p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg line-clamp-2">{ticket.title}</h3>
                  <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {ticket.status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ticket.description}</p>

                <div className="text-xs text-gray-500 space-y-1">
                  <div>Location: {ticket.location}</div>
                  <div>Created By: {ticket.createdBy}</div>
                  {ticket.assignedTo && <div>Assigned To: {ticket.assignedTo}</div>}
                </div>

                {!ticket.assignedTo && (
                  <div className="mt-5">
                    <select
                      defaultValue=""
                      onChange={(e) => assignTechnician(ticket.id, e.target.value)}
                      className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 text-sm"
                    >
                      <option value="" disabled>Assign Technician...</option>
                      {users
                        .filter((u) => u.roles?.includes("TECHNICIAN"))
                        .map((u) => (
                          <option key={u.clerkUserId} value={u.clerkUserId}>
                            {u.name || u.email}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}