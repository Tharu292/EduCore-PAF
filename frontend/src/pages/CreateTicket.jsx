import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { createTicket } from "../services/ticketService";
import Toast from "../components/Toast";
import AppLayout from "../components/AppLayout";

export default function CreateTicket() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "EQUIPMENT",
    priority: "MEDIUM",
    location: "",
    preferredContact: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      showToast("Please fill all required fields (Title, Description, Location)", "error");
      return;
    }

    if (!user?.id) {
      showToast("User information not loaded. Please try again.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const data = { ...form, createdBy: user.id };
      await createTicket(data);

      showToast("Ticket created successfully!", "success");
      setTimeout(() => navigate("/my-tickets"), 1200);
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.error ||
        err.message ||
        "Failed to create ticket. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading user information...
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-10">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <h2 className="text-4xl font-bold mb-8 text-gray-900">Create New Ticket</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500"
              placeholder="e.g. Projector not working in LH-03"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 resize-y"
              placeholder="Describe the issue in detail..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Location / Resource <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-6 py-4 border border-gray-300 rounded-2xl"
                placeholder="Lecture Hall 3, Main Building"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Contact</label>
              <input
                value={form.preferredContact}
                onChange={(e) => setForm({ ...form, preferredContact: e.target.value })}
                className="w-full px-6 py-4 border border-gray-300 rounded-2xl"
                placeholder="0771234567 or email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-6 py-4 border border-gray-300 rounded-2xl"
              >
                <option value="EQUIPMENT">Equipment</option>
                <option value="NETWORK">Network</option>
                <option value="SOFTWARE">Software</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-6 py-4 border border-gray-300 rounded-2xl"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-5 rounded-2xl font-semibold text-lg transition-all"
          >
            {submitting ? "Creating Ticket..." : "Submit Ticket"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}