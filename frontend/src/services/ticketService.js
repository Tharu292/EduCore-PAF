import API from "../api/axios";

// Tickets
export const createTicket = (data) => API.post("/tickets", data);
export const getAllTickets = () => API.get("/tickets");
export const getTicketById = (id) => API.get(`/tickets/${id}`);
export const getMyTickets = (username) => API.get(`/tickets/user/${username}`);
export const getTechnicianTickets = (name) => API.get(`/tickets/technician/${name}`);

// Status & Assignment
export const updateStatus = (id, status) =>
  API.put(`/tickets/${id}/status?status=${status}`);

export const assignTechnician = (id, technician, admin = "admin") =>
  API.put(`/tickets/${id}/assign`, null, { params: { technician, admin } });

// Comments
export const addComment = (id, data) => API.post(`/tickets/${id}/comments`, data);
export const updateComment = (ticketId, commentId, data) =>
  API.put(`/tickets/${ticketId}/comments/${commentId}`, data);
export const deleteComment = (ticketId, commentId, user) =>
  API.delete(`/tickets/${ticketId}/comments/${commentId}`, { params: { user } });

// Attachments
export const uploadImages = (id, formData) =>
  API.post(`/tickets/${id}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });