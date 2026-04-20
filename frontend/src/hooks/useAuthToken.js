import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import API from "../api/axios";

export default function useAuthToken() {
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptor = API.interceptors.request.use(async (config) => {
      const token = await getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    return () => API.interceptors.request.eject(interceptor);
  }, [getToken]);
}
