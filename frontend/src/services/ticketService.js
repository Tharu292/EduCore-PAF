import API from "../api/axios";

export const createTicket = (data) => API.post("/tickets", data);
export const getAllTickets = () => API.get("/tickets");
export const getTicketById = (id) => API.get(`/tickets/${id}`);
export const getMyTickets = (clerkUserId) => API.get(`/tickets/user/${clerkUserId}`);
export const getTechnicianTickets = (clerkUserId) => API.get(`/tickets/technician/${clerkUserId}`);

export const updateStatus = (id, status) =>
  API.put(`/tickets/${id}/status?status=${status}`);

export const assignTechnician = (ticketId, technicianClerkId) =>
  API.post(`/tickets/${ticketId}/assign?technicianClerkId=${technicianClerkId}`);

export const addComment = (ticketId, commentData) =>
  API.post(`/tickets/${ticketId}/comments`, commentData);

export const updateComment = (ticketId, commentId, updatedData) =>
  API.put(`/tickets/${ticketId}/comments/${commentId}`, updatedData);

export const deleteComment = (ticketId, commentId) =>
  API.delete(`/tickets/${ticketId}/comments/${commentId}`);

export const uploadImages = (ticketId, formData) =>
  API.post(`/tickets/${ticketId}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const removeAttachment = (ticketId, filename) =>
  API.delete(`/tickets/${ticketId}/attachments/${encodeURIComponent(filename)}`);