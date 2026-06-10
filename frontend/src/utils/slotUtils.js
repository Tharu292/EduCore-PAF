const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${hours}:${mins}`;
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isExpiredSlot = (date, startTime) => {
  const slotStart = new Date(`${date}T${startTime}:00`);
  return slotStart <= new Date();
};

const getAllowedDays = (availability = "") => {
  const firstPart = availability.replace(/\s+\d{2}:\d{2}-\d{2}:\d{2}.*/, "");

  if (firstPart === "Daily") {
    return new Set(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  }

  if (firstPart === "Mon-Fri") {
    return new Set(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  }

  return new Set(firstPart.split(",").map((day) => day.trim()).filter(Boolean));
};

const getTimeRange = (availability = "") => {
  const match = availability.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  return match ? { start: match[1], end: match[2] } : { start: "08:00", end: "17:00" };
};

const overlapsSlot = (slot, booking) => {
  if (booking.bookingDate !== slot.date) return false;

  const slotStart = timeToMinutes(slot.startTime);
  const slotEnd = timeToMinutes(slot.endTime);
  const bookingStart = timeToMinutes(String(booking.startTime).slice(0, 5));
  const bookingEnd = timeToMinutes(String(booking.endTime).slice(0, 5));

  return slotStart < bookingEnd && slotEnd > bookingStart;
};

const getSlotSummary = (slot, bookings, capacity) => {
  if (isExpiredSlot(slot.date, slot.startTime)) {
    return { pendingSeats: 0, bookedSeats: 0, seatsLeft: 0, status: "EXPIRED" };
  }

  const activeBookings = bookings.filter((booking) =>
    ["PENDING", "APPROVED"].includes(booking.status) && overlapsSlot(slot, booking)
  );

  const pendingSeats = activeBookings
    .filter((booking) => booking.status === "PENDING")
    .reduce((total, booking) => total + Number(booking.expectedAttendees || 0), 0);

  const bookedSeats = activeBookings
    .filter((booking) => booking.status === "APPROVED")
    .reduce((total, booking) => total + Number(booking.expectedAttendees || 0), 0);

  const seatsLeft = Math.max(capacity - pendingSeats - bookedSeats, 0);
  const status = seatsLeft <= 0 ? "FULL" : "AVAILABLE";

  return { pendingSeats, bookedSeats, seatsLeft, status };
};

export const buildResourceSlots = (resource, bookings = [], daysAhead = 7) => {
  const allowedDays = getAllowedDays(resource?.availability);
  const { start, end } = getTimeRange(resource?.availability);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  const capacity = Number(resource?.capacity || 0);
  const result = [];

  for (let offset = 0; offset < daysAhead; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const dayName = dayNames[date.getDay()];

    if (!allowedDays.has(dayName)) continue;

    const daySlots = [];
    let current = startMinutes;

    while (current < endMinutes) {
      const next = Math.min(current + 120, endMinutes);
      const slot = {
        date: formatDate(date),
        dayName,
        startTime: minutesToTime(current),
        endTime: minutesToTime(next),
      };

      daySlots.push({
        ...slot,
        ...getSlotSummary(slot, bookings, capacity),
      });

      current = next;
    }

    result.push({
      date: formatDate(date),
      dayName,
      label: offset === 0 ? "Today" : dayName,
      slots: daySlots,
    });
  }

  return result;
};
