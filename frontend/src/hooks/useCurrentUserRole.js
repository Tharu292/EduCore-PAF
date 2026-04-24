import { useEffect, useState } from "react";
import API from "../api/axios";
import { useUser } from "@clerk/clerk-react";

export default function useCurrentUserRole() {
  const { user, isLoaded, isSignedIn } = useUser();

  const [role, setRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoadingRole(true);

        const res = await API.get("/users/me");
        const backendRoles = res.data.roles || ["USER"];

        setRoles(backendRoles);

        if (backendRoles.includes("ADMIN")) setRole("ADMIN");
        else if (backendRoles.includes("TECHNICIAN")) setRole("TECHNICIAN");
        else setRole("USER");
      } catch (err) {
        console.error("Failed to fetch role:", err);
        setRole("USER");
        setRoles(["USER"]);
      } finally {
        setLoadingRole(false);
      }
    };

    if (isLoaded && isSignedIn && user?.id) {
      fetchRole();
    } else if (isLoaded && !isSignedIn) {
      setRole(null);
      setRoles([]);
      setLoadingRole(false);
    }
  }, [isLoaded, isSignedIn, user?.id]);

  return { role, roles, loadingRole };
}