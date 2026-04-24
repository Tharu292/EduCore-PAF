import API from "../api/axios";

// Get tickets by technicians
export const getTicketsByTechnician = (name) =>
  API.get(`/tickets/technician/${name}`);

// Assign technician
export const assignTechnician = (id, data) =>
  API.put(`/tickets/${id}/assign`, null, { params: data });

// Add comment
export const addComment = (id, data) =>
  API.post(`/tickets/${id}/comments`, data);

// Upload images
export const uploadImages = (id, formData) =>
  API.post(`/tickets/${id}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });