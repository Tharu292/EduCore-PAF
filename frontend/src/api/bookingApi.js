import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081/api/bookings",
});

export const createBooking = (data) => API.post("", data);
export const getAllBookings = (status = "") => API.get("", { params: status ? { status } : {} });
export const getStudentBookings = (studentId) => API.get(`/student/${studentId}`);
export const getResourceBookings = (resourceId) => API.get(`/resource/${resourceId}`);
export const approveBooking = (id, reason) => API.put(`/${id}/approve`, { reason });
export const rejectBooking = (id, reason) => API.put(`/${id}/reject`, { reason });
export const cancelBooking = (id) => API.put(`/${id}/cancel`);
export const rescheduleBooking = (id, data) => API.put(`/${id}/reschedule`, data);
