import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api/resources",
});

export const getResources = () => API.get("/");
export const createResource = (data) => API.post("/", data);
export const deleteResource = (id) => API.delete(`/${id}`);
export const updateResource = (id, data) => API.put(`/${id}`, data);

// OPTIONAL: backend search endpoint (if you add later)
export const searchResources = (params) => API.get("search", { params });
