import { useState, useEffect } from "react";
import { Users, Ticket, BarChart3 } from "lucide-react";
import API from "../api/axios";
import AppLayout from "../components/AppLayout";
import Toast from "../components/Toast";
import Analytics from "../components/Analytics";
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
      showToast(
        err.response?.data?.error || "Failed to assign technician",
        "error"
      );
    }
  };

  const technicians = users.filter((u) => u.roles?.includes("TECHNICIAN"));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Manage users, bookings, resources, and all maintenance tickets
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 border-b">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`pb-4 px-4 font-medium text-lg transition-all ${
            activeTab === "analytics"
              ? "border-b-4 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <BarChart3 size={20} />
            Analytics
          </span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`pb-4 px-4 font-medium text-lg transition-all ${
            activeTab === "users"
              ? "border-b-4 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Users size={20} />
            Users
          </span>
        </button>

        <button
          onClick={() => setActiveTab("tickets")}
          className={`pb-4 px-4 font-medium text-lg transition-all ${
            activeTab === "tickets"
              ? "border-b-4 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Ticket size={20} />
            Tickets
          </span>
        </button>
      </div>

      {activeTab === "analytics" && (
        <Analytics resources={resources} bookings={tickets.map((t) => ({
          resourceName: t.location || t.title || "Unknown",
          startTime: t.createdAt ? new Date(t.createdAt).toTimeString().slice(0, 5) : null,
        }))} />
      )}

      {activeTab === "users" && (
        <div className="bg-white rounded-3xl shadow p-8">
          <h2 className="text-2xl font-semibold mb-6">All Users</h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
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
                    <td className="px-6 py-5 font-medium">
                      {u.name || "Unnamed User"}
                    </td>
                    <td className="px-6 py-5 text-gray-600">{u.email}</td>
                    <td className="px-6 py-5">
                      <div className="flex gap-2 flex-wrap">
                        {u.roles?.map((role) => (
                          <span
                            key={role}
                            className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700"
                          >
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
                        <option value="" disabled>
                          Select role
                        </option>
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
          <h2 className="text-2xl font-semibold mb-6">
            All Tickets ({tickets.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-gray-200 rounded-3xl p-6 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg mb-2">{ticket.title}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {ticket.category} • {ticket.priority}
                </p>
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {ticket.description}
                </p>
                <p className="text-sm mb-2">Status: {ticket.status}</p>
                <p className="text-sm mb-4">
                  Assigned: {ticket.assignedTo || "Not assigned"}
                </p>

                <select
                  defaultValue=""
                  onChange={(e) =>
                    handleAssignTechnician(ticket.id, e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
                >
                  <option value="">Assign Technician</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.clerkUserId}>
                      {tech.name || tech.email}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}