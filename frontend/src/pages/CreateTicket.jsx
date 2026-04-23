import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardPlus,
  FileText,
  MapPin,
  Phone,
  AlertTriangle,
  Layers3,
} from "lucide-react";

import { createTicket } from "../services/ticketService";
import Toast from "../components/Toast";
import AppLayout from "../components/AppLayout";

export default function CreateTicket() {
  const navigate = useNavigate();

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

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = () => {
    if (!form.title.trim()) {
      showToast("Title is required", "error");
      return false;
    }

    if (!form.description.trim()) {
      showToast("Description is required", "error");
      return false;
    }

    if (!form.location.trim()) {
      showToast("Location or resource is required", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      await createTicket({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        location: form.location.trim(),
        preferredContact: form.preferredContact.trim(),
      });

      showToast("Ticket created successfully!");
      setTimeout(() => navigate("/my-tickets"), 1000);
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

  return (
    <AppLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900">Create New Ticket</h1>
          <p className="text-zinc-500 mt-2">
            Report an issue related to a campus resource, room, lab, equipment, or service.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-800">
                  Ticket Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <ClipboardPlus className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="w-full pl-11 pr-4 py-4 border border-zinc-200 rounded-2xl focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Projector not working in LH-03"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-800">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="w-5 h-5 text-zinc-400 absolute left-4 top-4" />
                  <textarea
                    required
                    rows={6}
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full pl-11 pr-4 py-4 border border-zinc-200 rounded-2xl focus:outline-none focus:border-blue-500 resize-y"
                    placeholder="Describe the issue in detail..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-800">
                    Location / Resource <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      value={form.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      className="w-full pl-11 pr-4 py-4 border border-zinc-200 rounded-2xl focus:outline-none focus:border-blue-500"
                      placeholder="Lecture Hall 3, Main Building"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-800">
                    Preferred Contact
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      value={form.preferredContact}
                      onChange={(e) =>
                        handleChange("preferredContact", e.target.value)
                      }
                      className="w-full pl-11 pr-4 py-4 border border-zinc-200 rounded-2xl focus:outline-none focus:border-blue-500"
                      placeholder="0771234567 or email"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-800">
                    Category
                  </label>
                  <div className="relative">
                    <Layers3 className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <select
                      value={form.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      className="w-full pl-11 pr-4 py-4 border border-zinc-200 rounded-2xl focus:outline-none focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="EQUIPMENT">Equipment</option>
                      <option value="NETWORK">Network</option>
                      <option value="SOFTWARE">Software</option>
                      <option value="FACILITY">Facility</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-800">
                    Priority
                  </label>
                  <div className="relative">
                    <AlertTriangle className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <select
                      value={form.priority}
                      onChange={(e) => handleChange("priority", e.target.value)}
                      className="w-full pl-11 pr-4 py-4 border border-zinc-200 rounded-2xl focus:outline-none focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-2xl font-semibold text-base transition-all"
                >
                  {submitting ? "Creating Ticket..." : "Submit Ticket"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/my-tickets")}
                  className="sm:w-auto px-6 py-4 border border-zinc-200 rounded-2xl hover:bg-zinc-50 font-medium text-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div className="bg-zinc-50 rounded-3xl border border-zinc-100 p-6 h-fit">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">
              Before you submit
            </h2>

            <div className="space-y-4 text-sm text-zinc-600">
              <div className="bg-white rounded-2xl border border-zinc-200 p-4">
                Include the exact room, hall, lab, or equipment name if possible.
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 p-4">
                Choose <span className="font-medium">High</span> priority only for urgent issues that affect usage immediately.
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 p-4">
                After creating the ticket, you can open it and upload up to 3 evidence images.
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 p-4">
                You will receive notifications when the ticket status changes or comments are added.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}