import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8081/api/auth",
});

export const login = (data) => API.post("/login", data);
export const registerStudent = (data) => API.post("/register", data);
