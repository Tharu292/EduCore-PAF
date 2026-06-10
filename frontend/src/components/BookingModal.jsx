import { useState } from "react";
import { X, CalendarDays, Clock3, Users, FileText } from "lucide-react";
import { createBooking } from "../api/bookingApi";

export default function BookingModal({ resource, onClose, onBooked, showToast }) {
  const [form, setForm] = useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "expectedAttendees" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createBooking({
        ...form,
        resourceId: resource.id,
      });

      showToast?.("Booking request submitted successfully", "success");
      onBooked?.();
      onClose?.();
    } catch (err) {
      showToast?.(
        err.response?.data?.error || "Failed to submit booking request",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!resource) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">Request Booking</h2>
            <p className="text-sm text-zinc-500 mt-1">
              {resource.name} • {resource.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-zinc-100"
          >
            <X className="w-5 h-5 text-zinc-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Booking Date
            </label>
            <div className="relative">
              <CalendarDays className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="date"
                name="bookingDate"
                value={form.bookingDate}
                onChange={handleChange}
                required
                className="w-full border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Expected Attendees
            </label>
            <div className="relative">
              <Users className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="number"
                name="expectedAttendees"
                min="1"
                max={resource.capacity}
                value={form.expectedAttendees}
                onChange={handleChange}
                required
                className="w-full border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Start Time
            </label>
            <div className="relative">
              <Clock3 className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                required
                className="w-full border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              End Time
            </label>
            <div className="relative">
              <Clock3 className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                required
                className="w-full border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Purpose
            </label>
            <div className="relative">
              <FileText className="w-5 h-5 absolute left-4 top-4 text-zinc-400" />
              <textarea
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Why do you need this resource?"
                className="w-full border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-zinc-400 resize-none"
              />
            </div>
          </div>

          <div className="md:col-span-2 flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-medium disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Booking Request"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 border border-zinc-200 hover:bg-zinc-50 rounded-2xl font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}