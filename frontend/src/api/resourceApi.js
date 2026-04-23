import API from "./axios";

export const getResources = () => API.get("/resources");

export const getResourceById = (id) => API.get(`/resources/${id}`);

export const createResource = (data) => API.post("/resources", data);

export const updateResource = (id, data) => API.put(`/resources/${id}`, data);

export const deleteResource = (id) => API.delete(`/resources/${id}`);

export const searchResources = (params) =>
  API.get("/resources/search", { params });