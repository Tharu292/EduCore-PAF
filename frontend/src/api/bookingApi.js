import API from "./axios";

export const createBooking = (data) => API.post("/bookings", data);

export const getAllBookings = (status = "") =>
  API.get("/bookings", {
    params: status ? { status } : {},
  });

export const getMyBookings = () => API.get("/bookings/me");

export const getResourceBookings = (resourceId) =>
  API.get(`/bookings/resource/${resourceId}`);

export const approveBooking = (id, reason = "") =>
  API.put(`/bookings/${id}/approve`, { reason });

export const rejectBooking = (id, reason = "") =>
  API.put(`/bookings/${id}/reject`, { reason });

export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);

export const rescheduleBooking = (id, data) =>
  API.put(`/bookings/${id}/reschedule`, data);