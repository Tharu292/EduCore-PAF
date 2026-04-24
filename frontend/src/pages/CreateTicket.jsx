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

      <div className="space-y-8">
        {/* Gradient Banner */}
        <div className="bg-gradient-to-r from-[#006591] via-[#006591] to-[#e31836] rounded-3xl p-8 md:p-5 text-white shadow-sm relative overflow-hidden">
          <div className="max-w-2xl">
            <h1 className="text-2xl md:text-2xl font-semibold tracking-tight">
              Create New Ticket
            </h1>
            <p className="mt-3 text-lg text-white/90">
              Report an issue related to a campus resource, room, lab, equipment, or service.
            </p>
          </div>

          <div className="absolute top-6 right-8 opacity-10">
            <div className="w-32 h-32 border-8 border-white rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Form Card */}
          <div className="xl:col-span-2 bg-white rounded-3xl shadow-md border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Ticket Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <ClipboardPlus className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#006591] focus:ring-1 focus:ring-[#006591]/20 transition-all"
                    placeholder="e.g. Projector not working in LH-03"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                  <textarea
                    required
                    rows={6}
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#006591] focus:ring-1 focus:ring-[#006591]/20 resize-y transition-all"
                    placeholder="Describe the issue in detail..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Location / Resource <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      value={form.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#006591] focus:ring-1 focus:ring-[#006591]/20 transition-all"
                      placeholder="Lecture Hall 3, Main Building"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Preferred Contact
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      value={form.preferredContact}
                      onChange={(e) => handleChange("preferredContact", e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#006591] focus:ring-1 focus:ring-[#006591]/20 transition-all"
                      placeholder="0771234567 or email"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
                  <div className="relative">
                    <Layers3 className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <select
                      value={form.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#006591] appearance-none bg-white"
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
                  <label className="block text-sm font-medium mb-2 text-gray-700">Priority</label>
                  <div className="relative">
                    <AlertTriangle className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <select
                      value={form.priority}
                      onChange={(e) => handleChange("priority", e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#006591] appearance-none bg-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#006591] hover:bg-[#006591]/90 disabled:bg-[#006591]/60 text-white py-3.5 rounded-2xl font-semibold transition-all active:scale-[0.985]"
                >
                  {submitting ? "Creating Ticket..." : "Create Ticket"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/my-tickets")}
                  className="sm:w-auto px-10 py-3.5 border border-gray-300 rounded-2xl hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Guidelines Card */}
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 h-fit">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Before You Submit
            </h2>

            <div className="space-y-5 text-sm text-gray-600">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                Include the exact room, hall, lab, or equipment name if possible.
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                Choose <span className="font-medium text-amber-600">High</span> priority only for urgent issues.
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                You can upload up to 3 images after creating the ticket.
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                You will receive notifications when the ticket is updated.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}