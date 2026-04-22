import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarClock, CheckCircle2, Clock, Search, Users } from "lucide-react";
import { getResources } from "../api/resourceApi";
import { createBooking, getResourceBookings } from "../api/bookingApi";
import SearchFilter from "../components/SearchFilter";
import { buildResourceSlots } from "../utils/slotUtils";

function ResourceBookingPage() {
  const currentUser = JSON.parse(localStorage.getItem("smartCampusUser") || "{}");
  const [resources, setResources] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceBookings, setResourceBookings] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ purpose: "", expectedAttendees: 1 });

  const fetchResources = useCallback(async () => {
    try {
      const res = await getResources();
      const active = (res.data || []).filter((resource) => resource.status === "ACTIVE");
      setResources(active);
      setFiltered(active);
      if (!selectedResource && active.length > 0) {
        setSelectedResource(active[0]);
      }
    } catch (error) {
      toast.error("Failed to load resources");
    }
  }, [selectedResource]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const fetchResourceBookings = useCallback(async () => {
    if (!selectedResource?.id) return;
    try {
      const res = await getResourceBookings(selectedResource.id);
      setResourceBookings(res.data || []);
    } catch (error) {
      toast.error("Failed to load resource slots");
    }
  }, [selectedResource?.id]);

  useEffect(() => {
    fetchResourceBookings();
    setSelectedSlot(null);
  }, [fetchResourceBookings]);

  const groupedSlots = useMemo(
    () => selectedResource ? buildResourceSlots(selectedResource, resourceBookings, 7) : [],
    [selectedResource, resourceBookings]
  );

  const handleFilter = useCallback((filters) => {
    let result = [...resources];

    if (filters?.search?.trim()) {
      const searchText = filters.search.toLowerCase().trim();
      result = result.filter((resource) =>
        (resource.name || "").toLowerCase().includes(searchText)
          || (resource.location || "").toLowerCase().includes(searchText)
      );
    }

    if (filters?.type) {
      result = result.filter((resource) => resource.type === filters.type);
    }

    if (filters?.status) {
      result = result.filter((resource) => resource.status === filters.status);
    }

    setFiltered(result);
  }, [resources]);

  const submitBooking = async (e) => {
    e.preventDefault();

    if (!selectedSlot || !selectedResource) {
      toast.error("Please select an available slot");
      return;
    }

    try {
      await createBooking({
        resourceId: selectedResource.id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        bookingDate: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        purpose: form.purpose,
        expectedAttendees: Number(form.expectedAttendees),
      });
      toast.success("Booking request sent for admin approval");
      setForm({ purpose: "", expectedAttendees: 1 });
      setSelectedSlot(null);
      fetchResourceBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Booking request failed");
    }
  };

  const statusClass = (status) => {
    if (status === "BOOKED") return "border-emerald-200 bg-emerald-50 text-emerald-800";
    if (status === "PENDING") return "border-amber-200 bg-amber-50 text-amber-800";
    return "border-zinc-200 bg-white text-zinc-800 hover:border-blue-300 hover:bg-blue-50";
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-zinc-900">Book a Resource</h1>
          <p className="text-zinc-500 mt-2">Select a resource, choose a two-hour slot, and send it for admin approval.</p>
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl p-6 mb-8">
          <SearchFilter onFilter={handleFilter} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-4">
            {filtered.map((resource) => (
              <button
                key={resource.id}
                onClick={() => setSelectedResource(resource)}
                className={`w-full text-left border rounded-2xl p-5 transition ${
                  selectedResource?.id === resource.id ? "border-blue-400 bg-blue-50" : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-zinc-900">{resource.name}</h2>
                    <p className="text-sm text-zinc-500">{resource.location}</p>
                  </div>
                  <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-2xl">
                    {resource.type}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-600">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {resource.capacity}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {resource.availability}</span>
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="bg-white border border-zinc-100 rounded-2xl p-8 text-center text-zinc-500">
                <Search className="w-8 h-8 mx-auto mb-3 text-zinc-400" />
                No active resources found.
              </div>
            )}
          </aside>

          <main className="lg:col-span-8 space-y-8">
            <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                <CalendarClock className="w-5 h-5 text-zinc-500" />
                <h2 className="font-semibold text-zinc-900">
                  {selectedResource ? `${selectedResource.name} Slots` : "Select a resource"}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {groupedSlots.map((day) => (
                  <section key={day.date}>
                    <div className="mb-3">
                      <h3 className="font-semibold text-zinc-900">{day.dayName}</h3>
                      <p className="text-sm text-zinc-500">{day.date}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {day.slots.map((slot) => {
                        const isSelected = selectedSlot
                          && selectedSlot.date === slot.date
                          && selectedSlot.startTime === slot.startTime;

                        return (
                          <button
                            key={`${slot.date}-${slot.startTime}`}
                            disabled={slot.status !== "AVAILABLE"}
                            onClick={() => setSelectedSlot(slot)}
                            className={`border rounded-2xl px-4 py-3 text-left transition disabled:cursor-not-allowed ${statusClass(slot.status)} ${
                              isSelected ? "ring-2 ring-blue-500 border-blue-500" : ""
                            }`}
                          >
                            <div className="font-semibold">{slot.startTime} - {slot.endTime}</div>
                            <div className="text-xs mt-1">{slot.status === "AVAILABLE" ? "Available" : slot.status === "PENDING" ? "Pending approval" : "Booked"}</div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <form onSubmit={submitBooking} className="bg-white border border-zinc-100 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Booking Request</h2>
                <p className="text-sm text-zinc-500">
                  {selectedSlot ? `${selectedSlot.date} | ${selectedSlot.startTime} - ${selectedSlot.endTime}` : "Choose an available slot above"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Purpose</label>
                <textarea
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  required
                  rows="3"
                  className="w-full border border-zinc-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Expected Attendees</label>
                <input
                  type="number"
                  min="1"
                  max={selectedResource?.capacity || 1}
                  value={form.expectedAttendees}
                  onChange={(e) => setForm({ ...form, expectedAttendees: e.target.value })}
                  required
                  className="w-full border border-zinc-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <button
                disabled={!selectedSlot}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-5 h-5" />
                Request Booking
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ResourceBookingPage;
