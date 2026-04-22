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

const getSlotStatus = (slot, bookings) => {
  const matching = bookings.find((booking) =>
    booking.bookingDate === slot.date
      && String(booking.startTime).slice(0, 5) === slot.startTime
      && String(booking.endTime).slice(0, 5) === slot.endTime
      && ["PENDING", "APPROVED"].includes(booking.status)
  );

  if (!matching) return "AVAILABLE";
  return matching.status === "APPROVED" ? "BOOKED" : "PENDING";
};

export const buildResourceSlots = (resource, bookings = [], daysAhead = 7) => {
  const allowedDays = getAllowedDays(resource?.availability);
  const { start, end } = getTimeRange(resource?.availability);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
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
        status: getSlotStatus(slot, bookings),
      });

      current = next;
    }

    result.push({
      date: formatDate(date),
      dayName,
      slots: daySlots,
    });
  }

  return result;
};
