import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CalendarDays, CalendarClock, CheckCircle2, Clock, RotateCcw, Search, Users, X } from "lucide-react";
import { getResources } from "../api/resourceApi";
import { createBooking, getResourceBookings, rescheduleBooking } from "../api/bookingApi";
import { getResourceReviewSummary } from "../api/reviewApi";
import SearchFilter from "../components/SearchFilter";
import { buildResourceSlots } from "../utils/slotUtils";

function ResourceBookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const rescheduleTarget = location.state?.rescheduleBooking || null;
  const currentUser = JSON.parse(localStorage.getItem("smartCampusUser") || "{}");
  const [resources, setResources] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceBookings, setResourceBookings] = useState([]);
  const [ratingSummaries, setRatingSummaries] = useState({});
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({
    purpose: rescheduleTarget?.purpose || "",
    expectedAttendees: rescheduleTarget?.expectedAttendees || 1
  });

  const fetchResources = useCallback(async () => {
    try {
      const res = await getResources();
      const active = (res.data || []).filter((resource) => resource.status === "ACTIVE");
      const targetResource = rescheduleTarget
        ? active.find((resource) => resource.id === rescheduleTarget.resourceId)
        : null;
      const visibleResources = targetResource ? [targetResource] : active;

      setResources(visibleResources);
      setFiltered(visibleResources);
      if (!selectedResource && active.length > 0) {
        setSelectedResource(targetResource || active[0]);
      }

      const summaries = await Promise.all(
        visibleResources.map((resource) =>
          getResourceReviewSummary(resource.id)
            .then((summary) => [resource.id, summary.data])
            .catch(() => [resource.id, { averageRating: 0, reviewCount: 0 }])
        )
      );
      setRatingSummaries(Object.fromEntries(summaries));
    } catch (error) {
      toast.error("Failed to load resources");
    }
  }, [rescheduleTarget, selectedResource]);

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
    setSelectedDay("");
    setSelectedSlot(null);
  }, [fetchResourceBookings]);

  const groupedSlots = useMemo(
    () => selectedResource ? buildResourceSlots(selectedResource, resourceBookings, 7) : [],
    [selectedResource, resourceBookings]
  );

  useEffect(() => {
    if (groupedSlots.length > 0 && !groupedSlots.some((day) => day.date === selectedDay)) {
      setSelectedDay(groupedSlots[0].date);
    }
  }, [groupedSlots, selectedDay]);

  const activeDay = groupedSlots.find((day) => day.date === selectedDay);

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

    if (Number(form.expectedAttendees) > selectedSlot.seatsLeft) {
      toast.error(`Only ${selectedSlot.seatsLeft} seats left in this slot`);
      return;
    }

    try {
      if (rescheduleTarget) {
        await rescheduleBooking(rescheduleTarget.id, {
          bookingDate: selectedSlot.date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          expectedAttendees: Number(form.expectedAttendees),
        });
        toast.success("Reschedule request sent for admin approval");
        navigate("/user");
        return;
      }

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

  const statusClass = (slot) => {
    if (slot.status === "EXPIRED") return "border-zinc-200 bg-zinc-100 text-zinc-400";
    if (slot.status === "FULL") return "border-zinc-200 bg-zinc-100 text-zinc-500";
    if (slot.bookedSeats > 0 || slot.pendingSeats > 0) return "border-amber-200 bg-amber-50 text-amber-900 hover:border-blue-300 hover:bg-blue-50";
    return "border-zinc-200 bg-white text-zinc-800 hover:border-blue-300 hover:bg-blue-50";
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-zinc-900">
            {rescheduleTarget ? "Reschedule Booking" : "Book a Resource"}
          </h1>
          <p className="text-zinc-500 mt-2">
            {rescheduleTarget
              ? "Choose a new day and slot using the resource availability view."
              : "Select a resource, choose a two-hour slot, and send it for admin approval."}
          </p>
        </div>

        {rescheduleTarget && (
          <div className="bg-blue-50 border border-blue-100 text-blue-900 rounded-2xl p-5 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Rescheduling: {rescheduleTarget.resourceName}</p>
              <p className="text-sm mt-1">
                Current booking: {rescheduleTarget.bookingDate} | {String(rescheduleTarget.startTime).slice(0, 5)} - {String(rescheduleTarget.endTime).slice(0, 5)}
              </p>
            </div>
            <button
              onClick={() => navigate("/user")}
              className="flex items-center justify-center gap-2 border border-blue-200 bg-white hover:bg-blue-50 rounded-2xl px-4 py-2 text-sm font-medium"
            >
              <X className="w-4 h-4" />
              Cancel Reschedule
            </button>
          </div>
        )}

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
                  <span>
                    Rating: {ratingSummaries[resource.id]?.averageRating || 0}/5 ({ratingSummaries[resource.id]?.reviewCount || 0})
                  </span>
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
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarDays className="w-5 h-5 text-zinc-500" />
                    <h3 className="font-semibold text-zinc-900">Select Day</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
                    {groupedSlots.map((day) => (
                      <button
                        key={day.date}
                        onClick={() => {
                          setSelectedDay(day.date);
                          setSelectedSlot(null);
                        }}
                        className={`border rounded-2xl px-4 py-3 text-left transition ${
                          selectedDay === day.date
                            ? "border-blue-500 bg-blue-50 text-blue-800"
                            : "border-zinc-200 bg-white hover:border-zinc-300"
                        }`}
                      >
                        <div className="text-sm font-semibold">{day.label}</div>
                        <div className="text-xs text-zinc-500 mt-1">{day.date}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {activeDay ? (
                  <section>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-zinc-900">{activeDay.dayName} Slots</h3>
                        <p className="text-sm text-zinc-500">{activeDay.date}</p>
                      </div>
                      <p className="text-sm text-zinc-500">Capacity: {selectedResource?.capacity || 0}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {activeDay.slots.map((slot) => {
                        const isSelected = selectedSlot
                          && selectedSlot.date === slot.date
                          && selectedSlot.startTime === slot.startTime;

                        return (
                          <button
                            key={`${slot.date}-${slot.startTime}`}
                            disabled={slot.status !== "AVAILABLE"}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setForm((current) => ({
                                ...current,
                                expectedAttendees: Math.min(Number(current.expectedAttendees || 1), slot.seatsLeft || 1),
                              }));
                            }}
                            className={`border rounded-2xl px-4 py-4 text-left transition disabled:cursor-not-allowed ${statusClass(slot)} ${
                              isSelected ? "ring-2 ring-blue-500 border-blue-500" : ""
                            }`}
                          >
                            <div className="font-semibold">{slot.startTime} - {slot.endTime}</div>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                              <span className="rounded-xl bg-white/70 border border-white px-2 py-1">
                                Left: <b>{slot.seatsLeft}</b>
                              </span>
                              <span className="rounded-xl bg-white/70 border border-white px-2 py-1">
                                Pending: <b>{slot.pendingSeats}</b>
                              </span>
                              <span className="rounded-xl bg-white/70 border border-white px-2 py-1">
                                Booked: <b>{slot.bookedSeats}</b>
                              </span>
                            </div>
                            <div className="text-xs mt-3 font-medium">
                              {slot.status === "AVAILABLE" ? "Available for request" : slot.status === "EXPIRED" ? "Expired" : "Full"}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ) : (
                  <div className="border border-zinc-200 bg-zinc-50 rounded-2xl p-8 text-center text-zinc-500">
                    No available days found for this resource window.
                  </div>
                )}
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
                  disabled={!!rescheduleTarget}
                  required
                  rows="3"
                  className="w-full border border-zinc-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Expected Attendees</label>
                <input
                  type="number"
                  min="1"
                  max={selectedSlot?.seatsLeft || selectedResource?.capacity || 1}
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
                {rescheduleTarget ? <RotateCcw className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                {rescheduleTarget ? "Send Reschedule Request" : "Request Booking"}
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ResourceBookingPage;
