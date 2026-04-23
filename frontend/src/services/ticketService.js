import API from "../api/axios";

export const createTicket = (data) => API.post("/tickets", data);
export const getAllTickets = () => API.get("/tickets");
export const getTicketById = (id) => API.get(`/tickets/${id}`);

export const getUserTickets = (clerkUserId) =>
  API.get(`/tickets/user/${clerkUserId}`);

// optional alias so old imports don't break immediately
export const getMyTickets = getUserTickets;

export const getTechnicianTickets = (clerkUserId) =>
  API.get(`/tickets/technician/${clerkUserId}`);

export const updateStatus = (
  id,
  status,
  reason = "",
  resolutionNotes = ""
) =>
  API.put(`/tickets/${id}/status`, null, {
    params: { status, reason, resolutionNotes },
  });

export const assignTechnician = (ticketId, technicianClerkId) =>
  API.post(`/tickets/${ticketId}/assign`, null, {
    params: { technicianClerkId },
  });

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