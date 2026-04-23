import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

API.interceptors.request.use(
  async (config) => {
    try {
      const clerk = window.Clerk;
      const token = await clerk?.session?.getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.log("Token attach failed", err);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;